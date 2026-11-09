import contextlib
import copy
import io
import json
import traceback


def _eq(got, want, tol):
    if isinstance(want, bool) or isinstance(got, bool):
        return isinstance(got, bool) and isinstance(want, bool) and got == want
    if isinstance(want, (int, float)) and isinstance(got, (int, float)):
        return abs(got - want) <= max(tol, 0.0) if (isinstance(want, float) or isinstance(got, float)) else got == want
    if isinstance(want, (list, tuple)) and isinstance(got, (list, tuple)):
        return len(got) == len(want) and all(_eq(g, w, tol) for g, w in zip(got, want))
    if isinstance(want, dict) and isinstance(got, dict):
        return set(got) == set(want) and all(_eq(got[k], want[k], tol) for k in want)
    return got == want


def _short(x, n=200):
    s = repr(x)
    return s if len(s) <= n else s[:n] + "..."


_res = {"stdout": "", "error": None, "tests": []}
_buf = io.StringIO()
_ns = {"__name__": "__main__"}
with contextlib.redirect_stdout(_buf):
    try:
        exec(compile(USER_CODE, "<твой код>", "exec"), _ns)
    except BaseException:
        _res["error"] = traceback.format_exc(limit=-3)
    if _res["error"] is None:
        _f = _ns.get(FN)
        if not callable(_f):
            _res["error"] = "Не найдена функция " + FN + ". Не переименовывай её и не удаляй def."
        else:
            for _c in json.loads(CASES_JSON):
                _args = copy.deepcopy(_c["args"])
                _entry = {"hidden": bool(_c.get("hidden")), "args": _short(_c["args"]) if not _c.get("hidden") else None,
                          "want": _short(_c["expected"]) if not _c.get("hidden") else None}
                try:
                    _got = _f(*_args)
                    _entry["ok"] = bool(_eq(_got, _c["expected"], TOL))
                    _entry["got"] = _short(_got) if not _c.get("hidden") else None
                except BaseException:
                    _entry["ok"] = False
                    _entry["got"] = None
                    _entry["error"] = traceback.format_exc(limit=-2)
                _res["tests"].append(_entry)
_res["stdout"] = _buf.getvalue()[:4000]
_RESULT = json.dumps(_res, ensure_ascii=False)
_RESULT
