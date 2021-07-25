import { ExampleEntryPoint } from "./EntryPoint";

const entryPoint = new ExampleEntryPoint();
export const handler = entryPoint.handle.bind(entryPoint);
