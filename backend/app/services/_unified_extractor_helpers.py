"""Pure helpers extracted from ``unified_extractor.py``.

Only side-effect-free utilities live here: deterministic id generation,
evidence-layer inference from a plain dict, cover-page detection, and the
``blocks_for_llm`` formatter. Anything that touches the filesystem, calls
the LLM, or depends on module-level state stays in ``unified_extractor.py``.

Extracted in commit-pair 2D-1 to bring ``unified_extractor.py`` below 1800
lines without changing any public behavior.
"""
from __future__ import annotations

import hashlib
import re
from typing import Dict, List, Tuple


def generate_snippet_id(exhibit_id: str, page: int, text: str) -> str:
    """确定性 snippet ID: 同 exhibit + page + text → 同 ID"""
    normalized = text.strip().lower()[:100]
    content = f"{exhibit_id}:{page}:{normalized}"
    hash_str = hashlib.md5(content.encode('utf-8')).hexdigest()[:8]
    return f"snp_{exhibit_id}_{hash_str}"


def generate_entity_id(exhibit_id: str, index: int) -> str:
    """生成唯一 entity ID"""
    return f"ent_{exhibit_id}_{index}"


def generate_relation_id(exhibit_id: str, index: int) -> str:
    """生成唯一 relation ID"""
    return f"rel_{exhibit_id}_{index}"


def _infer_evidence_layer(item: Dict) -> str:
    """根据 evidence_purpose 和 evidence_type 推断证据层级"""
    purpose = item.get("evidence_purpose", "direct_proof")
    etype = item.get("evidence_type", "other")

    # significance 层：selectivity/credibility/impact proof
    if purpose in ["selectivity_proof", "credibility_proof", "impact_proof"]:
        return "significance"

    # significance 层的证据类型
    if etype in ["peer_achievement", "source_credibility", "quantitative_impact",
                  "membership_criteria", "salary_benchmark"]:
        return "significance"

    # proof 层：证明申请人的声明
    if etype in ["award", "membership_evaluation", "peer_assessment", "recommendation"]:
        return "proof"

    # claim 层：直接声明（主要证据类型）
    if etype in ["membership", "media_coverage", "judging", "contribution", "publication",
                  "exhibition", "leadership", "salary", "compensation", "commercial_success",
                  "scientific_research_project"]:
        return "claim"

    # context 层：背景信息
    return "context"


_COVER_PAGE_RE = re.compile(
    r"^#?\s*exhibit\s+[a-z][-–]?\d+\s*$", re.IGNORECASE
)


def _is_cover_page(page_data: Dict) -> bool:
    """Detect exhibit cover pages that contain only a label like 'Exhibit A-1'."""
    md = page_data.get("markdown_text", "").strip()
    if len(md) < 30 and _COVER_PAGE_RE.match(md):
        return True
    blocks = page_data.get("text_blocks", [])
    if len(blocks) <= 1:
        texts = [b.get("text_content", "").strip() for b in blocks]
        combined = " ".join(texts).strip()
        if len(combined) < 30 and _COVER_PAGE_RE.match(combined):
            return True
    return False


def format_blocks_for_llm(pages: List[Dict]) -> Tuple[str, Dict]:
    """将所有页的 blocks 格式化为 LLM 输入格式

    Returns:
        tuple: (blocks_text, block_map)
            - blocks_text: 格式化后的文本
            - block_map: {composite_id -> (page_num, block)} 的映射
    """
    lines = []
    block_map = {}

    for page_data in pages:
        page_num = page_data.get("page_number", 0)

        # Skip exhibit cover pages (e.g. pages containing only "Exhibit A-1")
        if _is_cover_page(page_data):
            continue

        blocks = page_data.get("text_blocks", [])

        for block in blocks:
            block_id = block.get("block_id", "")
            text = block.get("text_content", "").strip()

            # 跳过空文本或太短的文本
            if not text or len(text) < 5:
                continue

            # Use block_id directly if it already encodes page info (e.g. "p2_b0"),
            # otherwise prefix with page number to avoid collisions
            if block_id and re.match(r"p\d+_", block_id):
                composite_id = block_id
            else:
                composite_id = f"p{page_num}_{block_id}"
            block_map[composite_id] = (page_num, block)
            lines.append(f"[{composite_id}] {text}")

    return "\n".join(lines), block_map
