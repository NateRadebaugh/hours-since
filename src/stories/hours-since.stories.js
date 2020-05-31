import React from "react";
import App from "../App";

const RealDate = Date;

function mockDate(isoDate) {
  //@ts-ignore
  global.Date = class extends RealDate {
    //@ts-ignore
    constructor(...args) {
      if (args.length === 0) {
        return new RealDate(isoDate);
      }

      //@ts-ignore
      return new RealDate(...args);
    }
  };
}

export default {
  title: "Hours Since",
  component: App,
};

export function Example() {
  mockDate(new Date(2019, 0, 1, 7, 0, 0, 0));

  return <App />;
}
