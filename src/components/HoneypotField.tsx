import type { UseFormRegister, FieldValues, Path } from "react-hook-form";

/**
 * A field real users never see or fill in. Hidden from sighted users and
 * removed from tab order; still announced to screen readers (with a
 * "leave this blank" label) and present in the DOM for bots that fill
 * every input without simulating real navigation.
 */
export function HoneypotField<T extends FieldValues>({
  register,
}: {
  register: UseFormRegister<T>;
}) {
  return (
    <div className="sr-only" aria-hidden={false}>
      <label htmlFor="website">Leave this field blank</label>
      <input
        id="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register("website" as Path<T>)}
      />
    </div>
  );
}
