cd docs 
make html
cd ../packages/targety
yarn typedoc ./src/index.ts --out ./docs
cd ../..
node ./scripts/_deploy-docs.js