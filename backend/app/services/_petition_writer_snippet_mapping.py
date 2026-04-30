"""Pure helpers for translating between legacy and current snippet ID formats.

Lifted from ``petition_writer_v3.py`` in step 2D-2. These three functions only
read their arguments — no filesystem, no LLM, no module state — so the move
is behavior-preserving by construction.

Two snippet-id schemes coexist in the project:

* **Old:** ``snp_{exhibit}_p{page}_p{page}_b{block}_{hash}`` (6+ parts)
* **New:** ``snp_{exhibit}_{hash8}`` (3 parts)
* **Registry-native:** ``snip_*`` (snippet_registry's own format)
"""
from __future__ import annotations

from typing import Dict, List, Optional


def _parse_old_snippet_id(old_id: str) -> Optional[Dict]:
    """
    解析 snippet ID（支持新旧两种格式）

    旧格式: snp_C2_p2_p2_b5_eadb0715 (6+ parts)
    → {exhibit_id: "C2", page: 2, block_full: "p2_b5", hash: "eadb0715", format: "old"}

    新格式: snp_C2_a3f5b1c2 (3 parts)
    → {exhibit_id: "C2", hash: "a3f5b1c2", format: "new"}
    """
    if not old_id or not old_id.startswith("snp_"):
        return None

    parts = old_id.split("_")

    # 新格式: snp_{exhibit}_{hash8} → 3 parts
    if len(parts) == 3:
        return {
            "exhibit_id": parts[1],
            "hash": parts[2],
            "format": "new"
        }

    # 旧格式: snp_{exhibit}_{pX}_{pY}_{bZ}_{hash} → 6+ parts
    if len(parts) >= 6:
        try:
            exhibit_id = parts[1]
            page_part1 = parts[2]
            page_part2 = parts[3]
            block_part = parts[4]
            hash_part = parts[5]

            page = int(page_part1[1:]) if page_part1.startswith("p") else 0
            block_full = f"{page_part2}_{block_part}"

            return {
                "exhibit_id": exhibit_id,
                "page": page,
                "block": block_part,
                "block_full": block_full,
                "hash": hash_part,
                "format": "old"
            }
        except (IndexError, ValueError):
            return None

    return None


def _map_old_snippet_id_to_new(
    old_id: str,
    snippet_registry: List[Dict]
) -> Optional[Dict]:
    """
    将 snippet ID 映射到 registry snippet（支持新旧格式）

    新格式 (snp_{exhibit}_{hash8}): 直接按 snippet_id 查找
    旧格式 (snp_{exhibit}_{pX}_{pY}_{bZ}_{hash}): 按 exhibit + block_full 匹配
    snip_ 格式: 直接按 snippet_id 查找
    """
    # snip_ 格式（snippet_registry 自身的格式）
    if old_id.startswith("snip_"):
        for snip in snippet_registry:
            if snip.get("snippet_id") == old_id:
                return snip
        return None

    parsed = _parse_old_snippet_id(old_id)
    if not parsed:
        return None

    # 新格式: 直接按 snippet_id 查找
    if parsed.get("format") == "new":
        for snip in snippet_registry:
            if snip.get("snippet_id") == old_id:
                return snip
        return None

    # 旧格式: 按 exhibit_id + source_block_ids/block_id 匹配
    for snip in snippet_registry:
        if snip.get("exhibit_id") != parsed["exhibit_id"]:
            continue

        # Check source_block_ids first
        source_blocks = snip.get("source_block_ids", [])
        if parsed.get("block_full") and parsed["block_full"] in source_blocks:
            return snip

        # Fallback: check block_id field directly
        if parsed.get("block_full") and snip.get("block_id") == parsed["block_full"]:
            return snip

    return None


def _build_snippet_lookup(snippet_registry: List[Dict]) -> Dict:
    """
    构建双向查找表

    Returns:
        {
            "by_new_id": {"snip_xxx": snippet_dict},
            "by_exhibit_block": {("C2", "p2_b5"): snippet_dict}
        }
    """
    by_new_id = {}
    by_exhibit_block = {}

    for snip in snippet_registry:
        new_id = snip.get("snippet_id", "")
        by_new_id[new_id] = snip

        exhibit_id = snip.get("exhibit_id", "")
        for block_id in snip.get("source_block_ids", []):
            key = (exhibit_id, block_id)
            by_exhibit_block[key] = snip

    return {
        "by_new_id": by_new_id,
        "by_exhibit_block": by_exhibit_block
    }
