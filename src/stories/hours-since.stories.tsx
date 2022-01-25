import Home from "../pages/index";

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
  component: Home,
};

export const Example = () => {
  mockDate(new Date(2019, 0, 1, 7, 0, 0, 0));
  
  return <Home />;
};

Example.story = {
  parameters: {
    nextRouter: {
      query: {
        start: "6:45 AM",
      },
    },
  },
}