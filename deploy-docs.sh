cd docs 
make html
cd ../packages/targety
yarn typedoc ./src/index.ts --out ./docs
cd ../..
node _deploy-docs.js