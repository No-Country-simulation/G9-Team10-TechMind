import typing

def apply_pydantic_patch():
    """
    Solución temporal para la incompatibilidad de Pydantic con Python 3.14-alpha.
    """
    original_eval_type = getattr(typing, '_eval_type', None)
    if original_eval_type:
        def patched_eval_type(*args, **kwargs):
            kwargs.pop('prefer_fwd_module', None)
            return original_eval_type(*args, **kwargs)
        typing._eval_type = patched_eval_type
