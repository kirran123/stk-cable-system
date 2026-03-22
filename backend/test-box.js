import { updateCustomer } from './google-sheets.js';

async function test() {
  await updateCustomer("1", { boxNumber: "3381676912" });
  console.log("Restored Customer 1 boxNumber");
}
test();
