/** Below entries added to placate typescript about importing non-js/ts contents
 *  From official docs: https://www.typescriptlang.org/docs/handbook/modules.html#wildcard-module-declarations
 *  For webpack: https://github.com/webpack-contrib/raw-loader/issues/56
 */

declare module "*.txt" {
  const content: string;
  export default content;
}

declare module "@pathcheck/dcc-sdk";
