const initialValue = {
  moves: [],
};

export default class Store {
  #state = initialValue;

  constructor() {}

  get game() {
    return "test value";
  }

  #getState() {
    return this.#state;
  }

  #saveState(stateOrFn) {
    const previousState = this.#getState();

    let newState;

    switch (typeof stateOrFn) {
      case "function":
        newState = stateOrFn(previousState);
        break;
      case "object":
        newState = stateOrFn;
        break;
      default:
        throw new Error("Invalid argument passed to saveState");
    }

    this.#state = newState;
  }
}
