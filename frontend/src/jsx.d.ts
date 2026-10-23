declare module "*.jsx" {
  import type { ComponentType } from "react";
  const Component: ComponentType;
  export default Component;
}
