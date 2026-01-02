const { ethers } = require('hardhat');

async function main() {
  const [owner, issuer] = await ethers.getSigners();
  console.log('Owner:', owner.address);
  console.log('Issuer:', issuer.address);

  // Deploy fresh registry instances (for local demo convenience)
  const IssuerRegistry = await ethers.getContractFactory('IssuerRegistry');
  const issuerReg = await IssuerRegistry.deploy();
  await issuerReg.deployed();

  const DocumentRegistry = await ethers.getContractFactory('DocumentRegistry');
  const docReg = await DocumentRegistry.deploy();
  await docReg.deployed();

  console.log('IssuerRegistry:', issuerReg.address);
  console.log('DocumentRegistry:', docReg.address);

  // issuer registers itself as trusted (owner is deployer here so we use owner)
  await issuerReg.addIssuer(issuer.address, 'Sample Issuer');
  console.log('Added issuer to registry');

  // create a sample doc hash and sign it off-chain with issuer
  const sample = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('sample-document'));
  const sig = await issuer.signMessage(ethers.utils.arrayify(sample));

  // register the document using owner as caller (allowed by our contract, owner becomes doc owner)
  const tx = await docReg.connect(owner).registerDocument(sample, issuer.address, sig, ethers.constants.HashZero);
  const receipt = await tx.wait();
  console.log('Registered document:', sample);
  console.log('Tx hash:', receipt.transactionHash);

  // fetch and print doc
  const doc = await docReg.getDocument(sample);
  console.log('Stored doc:', doc);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
