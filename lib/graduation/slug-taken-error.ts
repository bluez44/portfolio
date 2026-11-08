export class SlugTakenError extends Error {
  constructor() {
    super("Slug already taken");
  }
}
