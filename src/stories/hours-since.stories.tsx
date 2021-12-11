import React from "react";
import App from "../pages/index";

import "../styles/styles.scss";
import "@nateradebaugh/react-datetime/scss/styles.scss";

const RealDate = Date;

function mockDate(isoDate: Date) {
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
