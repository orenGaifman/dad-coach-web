/**
 * Utility for combining CSS class names.
 *
 * A lightweight alternative to clsx/classnames libraries.
 * Filters out falsy values (undefined, null, false, empty string).
 *
 * @example
 * classNames('base', isActive && 'active', className)
 * // => 'base active custom' (if isActive is true and className is 'custom')
 */
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
