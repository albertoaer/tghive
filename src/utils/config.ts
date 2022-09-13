export type Config<R,O> = Required<Pick<R, Exclude<keyof R, keyof O>>> & Partial<O>;
export type ValidConfig<T> = Required<T>;

export function fillConfig<R,O>(input: Config<R,O>, def: Required<O>): ValidConfig<R & O> {
    return Object.assign({}, def, input) as ValidConfig<R & O>;
}