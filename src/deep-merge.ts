export default function deepMerge<T = object>(
  target: T = {} as T,
  source: object = {}
) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object)
      Object.assign(source[key], deepMerge(target[key], source[key]));
  }

  Object.assign(target || {}, source);
  return target;
}
