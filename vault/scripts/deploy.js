const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with', deployer.address);

  const IssuerRegistry = await ethers.getContractFactory('IssuerRegistry');
  const issuer = await IssuerRegistry.deploy();
  await issuer.deployed();
  console.log('IssuerRegistry deployed to', issuer.address);

  const DocumentRegistry = await ethers.getContractFactory('DocumentRegistry');
  const doc = await DocumentRegistry.deploy();
  await doc.deployed();
  console.log('DocumentRegistry deployed to', doc.address);

  console.log('\nIMPORTANT: copy these addresses into your frontend/.env:');
  console.log('ISSUER_REGISTRY=', issuer.address);
  console.log('DOCUMENT_REGISTRY=', doc.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
