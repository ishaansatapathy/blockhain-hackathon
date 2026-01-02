export type KnowledgeCategory =
  | "basics"
  | "blockchain"
  | "identity"
  | "documents"
  | "voting"
  | "security"
  | "analytics"
  | "compliance"
  | "governance"
  | "implementation";

export interface KnowledgeItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: KnowledgeCategory;
}

export const zkpKnowledgeBase: KnowledgeItem[] = [
  {
    id: "basics-1",
    question: "What is a zero-knowledge proof?",
    answer:
      "A zero-knowledge proof (ZKP) lets one party prove a statement is true without revealing the underlying secret, offering privacy-preserving verification.",
    keywords: ["zero", "knowledge", "proof", "definition"],
    category: "basics",
  },
  {
    id: "basics-2",
    question: "How does a zero-knowledge proof work at a high level?",
    answer:
      "The prover encodes evidence in a cryptographic statement and the verifier checks mathematical constraints that guarantee validity without exposing raw data.",
    keywords: ["prover", "verifier", "workflow", "high level"],
    category: "basics",
  },
  {
    id: "basics-3",
    question: "What are the main roles in a ZKP protocol?",
    answer:
      "Every ZKP involves a prover who generates the proof and a verifier who confirms it, sometimes coordinated through a trusted setup or shared parameters.",
    keywords: ["roles", "prover", "verifier"],
    category: "basics",
  },
  {
    id: "basics-4",
    question: "Why are ZKPs powerful for identity systems?",
    answer:
      "ZKPs let users verify attributes like age, residency or credential ownership without revealing the full document, protecting privacy while proving compliance.",
    keywords: ["identity", "privacy", "attributes"],
    category: "identity",
  },
  {
    id: "basics-5",
    question: "What is the difference between interactive and non-interactive ZKPs?",
    answer:
      "Interactive proofs involve multiple message rounds between prover and verifier, while non-interactive proofs compress everything into a single transcript usable offline.",
    keywords: ["interactive", "non-interactive", "difference"],
    category: "basics",
  },
  {
    id: "basics-6",
    question: "What does zero-knowledge mean in practice?",
    answer:
      "Zero-knowledge ensures the verifier learns nothing beyond the fact that the statement is true, so they cannot reconstruct secrets or sensitive inputs from the proof.",
    keywords: ["meaning", "practice", "zero knowledge"],
    category: "basics",
  },
  {
    id: "basics-7",
    question: "What is soundness in a ZKP?",
    answer:
      "Soundness guarantees that a malicious prover cannot convince the verifier of a false statement; it ensures proofs reflect reality.",
    keywords: ["soundness", "guarantee", "definition"],
    category: "basics",
  },
  {
    id: "basics-8",
    question: "What is completeness in a ZKP?",
    answer:
      "Completeness means that honest provers can always convince honest verifiers when the statement is true, so valid claims should never be rejected.",
    keywords: ["completeness", "valid", "definition"],
    category: "basics",
  },
  {
    id: "basics-9",
    question: "What is a trusted setup ceremony?",
    answer:
      "A trusted setup is an initialization phase that generates parameters shared by all participants; if compromised, someone could forge proofs, so multi-party ceremonies reduce risk.",
    keywords: ["trusted setup", "ceremony", "parameters"],
    category: "implementation",
  },
  {
    id: "basics-10",
    question: "What are zk-SNARKs?",
    answer:
      "zk-SNARKs are succinct non-interactive ZKPs that produce tiny proofs and allow fast verification, making them practical for blockchains like Zcash, Aztec, and Mina.",
    keywords: ["zk-snark", "succinct", "definition"],
    category: "basics",
  },
  {
    id: "basics-11",
    question: "What are zk-STARKs?",
    answer:
      "zk-STARKs avoid trusted setups, rely on collision-resistant hash functions, and scale well for large computations at the cost of larger proof sizes.",
    keywords: ["zk-stark", "trusted setup", "hash"],
    category: "basics",
  },
  {
    id: "basics-12",
    question: "What is a proving key?",
    answer:
      "A proving key contains structured reference strings that help the prover compress their computation into a succinct proof for a specific circuit.",
    keywords: ["proving key", "structured reference", "circuit"],
    category: "implementation",
  },
  {
    id: "basics-13",
    question: "What is a verification key?",
    answer:
      "The verification key is a lightweight artifact derived from the trusted setup that lets verifiers quickly check proofs without repeating the full computation.",
    keywords: ["verification key", "lightweight"],
    category: "implementation",
  },
  {
    id: "basics-14",
    question: "Why are arithmetic circuits used in ZKPs?",
    answer:
      "ZKP systems express computations as arithmetic circuits over finite fields because they are easier to constrain and reason about than arbitrary code.",
    keywords: ["arithmetic circuit", "finite field"],
    category: "implementation",
  },
  {
    id: "basics-15",
    question: "What is witness data in a ZKP?",
    answer:
      "Witness data is the private input supplied by the prover to satisfy circuit constraints; it remains hidden from the verifier yet drives the proof.",
    keywords: ["witness", "private input", "constraints"],
    category: "implementation",
  },
  {
    id: "basics-16",
    question: "What is the Fiat-Shamir transform?",
    answer:
      "The Fiat-Shamir transform converts interactive ZKPs into non-interactive proofs by replacing verifier challenges with hash outputs, enabling offline verification.",
    keywords: ["fiat shamir", "transform", "non interactive"],
    category: "basics",
  },
  {
    id: "basics-17",
    question: "What makes ZKPs attractive for compliance?",
    answer:
      "They allow organizations to prove regulatory requirements like KYC, AML, or residency without storing full sensitive data, reducing liability while staying compliant.",
    keywords: ["compliance", "regulation", "privacy"],
    category: "compliance",
  },
  {
    id: "basics-18",
    question: "How do ZKPs help with selective disclosure?",
    answer:
      "Users can reveal only specific attributes from a credential, such as being over 18, without disclosing the full document or unrelated personal data.",
    keywords: ["selective disclosure", "attribute", "privacy"],
    category: "identity",
  },
  {
    id: "basics-19",
    question: "Why are ZKPs useful for censorship resistance?",
    answer:
      "Because proofs hide the underlying data, verifiers cannot discriminate against users who meet criteria, supporting fair access to services.",
    keywords: ["censorship", "resistance", "fair access"],
    category: "governance",
  },
  {
    id: "basics-20",
    question: "How do ZKPs reduce data retention risks?",
    answer:
      "Verifiers no longer store raw personal documents; they record proofs and minimal metadata, lowering the impact of breaches or insider threats.",
    keywords: ["data retention", "breach", "risk"],
    category: "security",
  },
  {
    id: "blockchain-1",
    question: "How are ZKPs used on blockchains?",
    answer:
      "Proofs can compress large computations into small verifications, allowing blockchains to check complex transactions or rollups without replaying every step.",
    keywords: ["blockchain", "compression", "rollup"],
    category: "blockchain",
  },
  {
    id: "blockchain-2",
    question: "What is a zk-rollup?",
    answer:
      "A zk-rollup batches many transactions off-chain, produces a proof summarizing the state change, and posts that proof on-chain for trustless verification.",
    keywords: ["zk rollup", "layer 2", "batching"],
    category: "blockchain",
  },
  {
    id: "blockchain-3",
    question: "How do ZKPs improve scalability?",
    answer:
      "They offload heavy computation off-chain and provide succinct correctness proofs, letting chains verify results quickly and increase throughput.",
    keywords: ["scalability", "throughput", "succinct"],
    category: "blockchain",
  },
  {
    id: "blockchain-4",
    question: "Why do zk-rollups lower transaction fees?",
    answer:
      "Because many operations are processed together and only lightweight proofs hit the base layer, the per-user gas cost decreases significantly.",
    keywords: ["fees", "rollup", "gas"],
    category: "blockchain",
  },
  {
    id: "blockchain-5",
    question: "What is shielded transactions?",
    answer:
      "Shielded transactions hide sender, receiver, and amount while proving the transfer obeys rules, enabling confidential payments on public ledgers.",
    keywords: ["shielded", "transactions", "confidential"],
    category: "blockchain",
  },
  {
    id: "blockchain-6",
    question: "How does Mina Protocol use ZKPs?",
    answer:
      "Mina relies on recursive zk-SNARKs to keep the blockchain size around 22 KB, so users verify the chain with a constant-size snapshot.",
    keywords: ["mina", "recursive", "constant size"],
    category: "blockchain",
  },
  {
    id: "blockchain-7",
    question: "What is recursive proof composition?",
    answer:
      "Recursive proofs verify other proofs, enabling rollups, privacy layers, and long-running workflows to be aggregated efficiently.",
    keywords: ["recursive", "composition", "aggregation"],
    category: "implementation",
  },
  {
    id: "blockchain-8",
    question: "What is a validity proof?",
    answer:
      "A validity proof shows the correctness of a state transition; in rollups it confirms every transaction follows protocol rules without re-execution.",
    keywords: ["validity proof", "state transition"],
    category: "blockchain",
  },
  {
    id: "blockchain-9",
    question: "How do ZKPs enable private smart contracts?",
    answer:
      "Smart contract logic executes off-chain, a proof attests to correct execution, and the public chain accepts the result without seeing raw inputs.",
    keywords: ["private", "smart contract", "execution"],
    category: "blockchain",
  },
  {
    id: "blockchain-10",
    question: "What is the trade-off between SNARKs and STARKs?",
    answer:
      "SNARKs offer tiny proofs but typically require trusted setups and elliptic curves, while STARKs avoid setups, rely on hashes, and create larger proofs.",
    keywords: ["trade off", "snark", "stark"],
    category: "implementation",
  },
  {
    id: "blockchain-11",
    question: "Why is proof verification cheaper than execution?",
    answer:
      "Verifiers only check algebraic constraints that summarize execution, drastically cutting gas costs relative to re-running full computation on-chain.",
    keywords: ["verification", "cheap", "constraints"],
    category: "blockchain",
  },
  {
    id: "blockchain-12",
    question: "What is a privacy pool?",
    answer:
      "A privacy pool mixes deposits and uses ZKPs to prove withdrawal legitimacy without revealing which account performed the withdrawal.",
    keywords: ["privacy pool", "mixing", "withdrawal"],
    category: "security",
  },
  {
    id: "blockchain-13",
    question: "How do ZKPs support on-chain identity?",
    answer:
      "Users can prove credential possession or reputation scores to smart contracts without exposing personal details, enabling privacy-aware access control.",
    keywords: ["on chain identity", "access control"],
    category: "identity",
  },
  {
    id: "blockchain-14",
    question: "What is a nullifier in private voting?",
    answer:
      "A nullifier is a one-time identifier derived from the voter credential; once recorded on-chain it prevents the same credential from voting twice.",
    keywords: ["nullifier", "double vote", "credential"],
    category: "voting",
  },
  {
    id: "blockchain-15",
    question: "Why is entropy important for proof generation?",
    answer:
      "High-quality randomness prevents attackers from predicting prover behavior and forging transcripts, especially in non-interactive schemes.",
    keywords: ["entropy", "randomness", "security"],
    category: "security",
  },
  {
    id: "blockchain-16",
    question: "What is a circuit constraint system?",
    answer:
      "It is a set of equations representing valid computation steps; satisfying all constraints proves the computation executed correctly.",
    keywords: ["constraints", "equations", "system"],
    category: "implementation",
  },
  {
    id: "blockchain-17",
    question: "What is Groth16?",
    answer:
      "Groth16 is a popular zk-SNARK proving system known for constant-size proofs and fast verification, widely adopted in privacy protocols.",
    keywords: ["groth16", "proof system"],
    category: "implementation",
  },
  {
    id: "blockchain-18",
    question: "Why do proofs expire in some systems?",
    answer:
      "Certain proofs encode current state commitments; if the state evolves, the old proof no longer matches, so verifiers require new proofs.",
    keywords: ["expiry", "state commitment"],
    category: "governance",
  },
  {
    id: "blockchain-19",
    question: "What is batched verification?",
    answer:
      "Batched verification uses shared randomness to confirm multiple proofs at once, cutting the per-proof cost for verifiers handling many users.",
    keywords: ["batch", "verification", "efficiency"],
    category: "implementation",
  },
  {
    id: "blockchain-20",
    question: "How do ZKPs help with interoperability?",
    answer:
      "Proofs can attest to events on one chain for use on another, bridging assets or credentials without trusting centralized relays.",
    keywords: ["interoperability", "bridge", "attestation"],
    category: "blockchain",
  },
  {
    id: "identity-1",
    question: "How can ZKPs protect Aadhaar details?",
    answer:
      "Instead of sharing the full Aadhaar PDF, a user can prove possession and specific attributes like name match or age threshold using ZKP commitments.",
    keywords: ["aadhaar", "attribute", "protection"],
    category: "identity",
  },
  {
    id: "identity-2",
    question: "What is a verifiable credential?",
    answer:
      "Verifiable credentials are digitally signed attestations issued by trusted authorities; ZKPs enable selective disclosure of these attestations.",
    keywords: ["verifiable credential", "attestation"],
    category: "identity",
  },
  {
    id: "identity-3",
    question: "How do decentralized identifiers relate to ZKPs?",
    answer:
      "Decentralized identifiers (DIDs) give users control over their identifiers; ZKPs layer privacy on top by proving DID claims without revealing secrets.",
    keywords: ["did", "identifier", "privacy"],
    category: "identity",
  },
  {
    id: "identity-4",
    question: "What is a revocation registry?",
    answer:
      "A revocation registry lists credentials that are no longer valid; ZKP schemes include proofs that a credential has not been revoked without exposing which credential it is.",
    keywords: ["revocation", "registry", "credential"],
    category: "identity",
  },
  {
    id: "identity-5",
    question: "How can age verification use ZKPs?",
    answer:
      "A user derives a proof that their date of birth is earlier than a threshold without disclosing the exact date, enabling privacy-preserving age gates.",
    keywords: ["age verification", "threshold", "dob"],
    category: "identity",
  },
  {
    id: "identity-6",
    question: "Why store document hashes instead of raw files?",
    answer:
      "Hashes confirm integrity without exposing sensitive data; ZKPs can prove a user knows the pre-image of a registered hash when needed.",
    keywords: ["hash", "integrity", "storage"],
    category: "documents",
  },
  {
    id: "identity-7",
    question: "How do proofs support multi-factor verification?",
    answer:
      "A ZKP can show that the holder satisfied factors like PIN + biometric template without revealing the template or the PIN itself.",
    keywords: ["multi factor", "pin", "biometric"],
    category: "security",
  },
  {
    id: "identity-8",
    question: "Can ZKPs help with GDPR compliance?",
    answer:
      "Yes, ZKPs minimize personal data exposure and support consent-driven disclosure, aligning with GDPR principles like data minimization and purpose limitation.",
    keywords: ["gdpr", "compliance", "consent"],
    category: "compliance",
  },
  {
    id: "identity-9",
    question: "How are ZKPs different from homomorphic encryption?",
    answer:
      "Homomorphic encryption lets you compute on encrypted data, while ZKPs prove that a computation was performed correctly without revealing the data.",
    keywords: ["homomorphic", "difference", "encryption"],
    category: "basics",
  },
  {
    id: "identity-10",
    question: "What is anonymous credential issuance?",
    answer:
      "Authorities issue credentials without learning which specific user receives which secret; ZKPs certify credential possession later without deanonymizing holders.",
    keywords: ["anonymous credential", "issuance"],
    category: "identity",
  },
  {
    id: "identity-11",
    question: "What is attribute-based access control with ZKPs?",
    answer:
      "Users prove they satisfy policy attributes via ZKPs, so services can authorize access without learning more than necessary about the user.",
    keywords: ["attribute based", "access control"],
    category: "identity",
  },
  {
    id: "identity-12",
    question: "How can ZKPs reduce insider threats?",
    answer:
      "Staff verify compliance proofs instead of handling raw documents, lowering opportunities for misuse or leakage of sensitive citizen data.",
    keywords: ["insider threat", "staff", "risk"],
    category: "security",
  },
  {
    id: "identity-13",
    question: "How are biometric hashes stored with ZKPs?",
    answer:
      "Biometric templates are hashed and the proof shows the live capture matches the stored hash, so raw biometric data never leaves the secure enclave.",
    keywords: ["biometric", "hash", "template"],
    category: "security",
  },
  {
    id: "identity-14",
    question: "What is an issuer, holder, and verifier model?",
    answer:
      "Issuers sign credentials, holders maintain them, and verifiers request ZKPs about credential claims, forming the trust triangle of digital identity.",
    keywords: ["issuer", "holder", "verifier"],
    category: "identity",
  },
  {
    id: "identity-15",
    question: "How do Merkle trees assist ZKP credentials?",
    answer:
      "Credential commitments are stored in a Merkle tree; the holder proves membership using a path without revealing which leaf they own.",
    keywords: ["merkle", "membership", "commitment"],
    category: "implementation",
  },
  {
    id: "documents-1",
    question: "How does TrustVault manage document proofs?",
    answer:
      "Each document stores metadata, file hash, and an optional proof payload; users trigger ZKP generation after uploading to produce shareable payloads.",
    keywords: ["trustvault", "document", "proof payload"],
    category: "documents",
  },
  {
    id: "documents-2",
    question: "Why generate a proof after uploading documents?",
    answer:
      "Proof generation binds the stored hash, timestamp, and credential claim, creating an auditable payload that can be shared with verifiers when needed.",
    keywords: ["generate proof", "bind", "payload"],
    category: "documents",
  },
  {
    id: "documents-3",
    question: "What happens if I upload a new file version?",
    answer:
      "TrustVault recomputes the hash, resets existing proofs, and asks you to regenerate a fresh ZKP so verifiers know the latest version is validated.",
    keywords: ["new version", "reset", "hash recompute"],
    category: "documents",
  },
  {
    id: "documents-4",
    question: "How is file integrity checked in the vault?",
    answer:
      "The vault stores cryptographic hashes; when you download or share, the system recomputes the hash to ensure it matches the recorded value.",
    keywords: ["integrity", "hash match", "download"],
    category: "documents",
  },
  {
    id: "documents-5",
    question: "Can I share proofs without sharing documents?",
    answer:
      "Yes, send the proof payload or QR; verifiers can confirm validity without accessing the underlying document, maintaining confidentiality.",
    keywords: ["share proof", "payload", "confidential"],
    category: "documents",
  },
  {
    id: "documents-6",
    question: "What is the role of transaction hashes in the vault?",
    answer:
      "Transaction hashes link document actions to blockchain anchors, offering tamper-evident audit trails when regulators or partners review history.",
    keywords: ["transaction hash", "audit", "anchor"],
    category: "documents",
  },
  {
    id: "documents-7",
    question: "Why does the vault require upload before proof generation?",
    answer:
      "Proofs depend on the document hash and metadata; without the file there is nothing to commit to, so upload must happen first.",
    keywords: ["upload first", "dependency"],
    category: "documents",
  },
  {
    id: "documents-8",
    question: "How does drag-and-drop ordering help audits?",
    answer:
      "Organizing documents lets compliance teams quickly find credentials by category, issuance date, or priority during audits or onboarding.",
    keywords: ["drag drop", "organization", "audit"],
    category: "documents",
  },
  {
    id: "documents-9",
    question: "What metadata should I fill when uploading?",
    answer:
      "Include issuing authority, document type, expiration date, and jurisdiction; these fields help generate tailored proofs and expiry alerts.",
    keywords: ["metadata", "upload", "fields"],
    category: "documents",
  },
  {
    id: "documents-10",
    question: "How can local storage persist my vault data?",
    answer:
      "TrustVault leverages browser storage for demo mode, keeping document references and proofs even after refresh, while production would sync with secure APIs.",
    keywords: ["local storage", "persistence", "demo"],
    category: "implementation",
  },
  {
    id: "documents-11",
    question: "How do I reset a proof payload?",
    answer:
      "Use the reset option on a card; it clears the cached payload so you can regenerate with updated metadata or a new compliance template.",
    keywords: ["reset proof", "payload", "update"],
    category: "documents",
  },
  {
    id: "documents-12",
    question: "What happens when I flag a document?",
    answer:
      "Flagging marks the document for review, surfaces it in the flagged tab, and prevents proof sharing until validation issues are resolved.",
    keywords: ["flag document", "review", "prevent sharing"],
    category: "documents",
  },
  {
    id: "documents-13",
    question: "How do ZKPs ensure document authenticity?",
    answer:
      "They prove the holder knows a document matching a stored hash issued by a trusted authority, stopping counterfeit submissions without exposing the entire file.",
    keywords: ["authenticity", "counterfeit", "hash"],
    category: "documents",
  },
  {
    id: "documents-14",
    question: "Why does the vault show confidential score?",
    answer:
      "The confidential score estimates how sensitive the data is and encourages users to share proofs instead of raw documents for high-scoring items.",
    keywords: ["confidential score", "sensitivity"],
    category: "security",
  },
  {
    id: "documents-15",
    question: "Can proofs expire with document validity?",
    answer:
      "Yes, proofs reference issue and expiry dates; once a document expires, verifiers will reject proofs until a refreshed credential is uploaded.",
    keywords: ["expiry", "verifier", "refresh"],
    category: "documents",
  },
  {
    id: "voting-1",
    question: "How does the Assembly Election flow start?",
    answer:
      "Users must pass the DEPIN PIN check, generate a ZKP from a verified document, and complete face verification before the ballot unlocks.",
    keywords: ["assembly election", "flow", "steps"],
    category: "voting",
  },
  {
    id: "voting-2",
    question: "Why is the DEPIN PIN set to 123456?",
    answer:
      "The demo PIN 123456 simulates a hardware token entry; in production this would integrate with a secure authenticator or Aadhaar-linked OTP.",
    keywords: ["depin", "pin", "123456"],
    category: "voting",
  },
  {
    id: "voting-3",
    question: "What triggers the ZKP proof selection in voting?",
    answer:
      "Clicking Generate Proof opens the vault picker so voters must choose a verified credential, creating a proof payload tied to their identity.",
    keywords: ["generate proof", "vault picker", "voting"],
    category: "voting",
  },
  {
    id: "voting-4",
    question: "How is face verification used in voting?",
    answer:
      "The app captures a selfie, hashes it, and displays a block hash plus confidential score; it demonstrates biometric logging without storing raw images.",
    keywords: ["face verification", "selfie", "hash"],
    category: "security",
  },
  {
    id: "voting-5",
    question: "Why can't the same person vote twice?",
    answer:
      "TrustVault records a vote receipt with the credential ID and marks the ballot as cast; repeated attempts show a warning that the vote is already recorded.",
    keywords: ["duplicate", "vote receipt", "warning"],
    category: "voting",
  },
  {
    id: "voting-6",
    question: "What is a block hash in the voting flow?",
    answer:
      "After voting, a mock blockchain hash is generated to symbolize tamper-evident record keeping for each ballot submission.",
    keywords: ["block hash", "ballot", "record"],
    category: "voting",
  },
  {
    id: "voting-7",
    question: "How does the system refresh for the next voter?",
    answer:
      "Once a vote is confirmed, TrustVault resets the PIN, proof, and face capture while retaining the tally, enabling continuous polling station usage.",
    keywords: ["reset", "next voter", "tally"],
    category: "voting",
  },
  {
    id: "voting-8",
    question: "Can I change my vote after submission?",
    answer:
      "No, the demo mimics immutable blockchain ballots, so once confirmed the vote receipt is final and the UI prevents additional submissions.",
    keywords: ["change vote", "immutable", "final"],
    category: "voting",
  },
  {
    id: "voting-9",
    question: "Where are candidate tallies displayed?",
    answer:
      "The right-hand panel shows live tallies with progress bars, updating immediately after each confirmed vote in the Assembly Election dashboard.",
    keywords: ["tally", "progress bar", "dashboard"],
    category: "voting",
  },
  {
    id: "voting-10",
    question: "How is voter anonymity preserved?",
    answer:
      "Proofs certify eligibility without revealing identity, and recorded hashes do not map back to personal data, combining privacy with accountability.",
    keywords: ["anonymity", "eligibility", "privacy"],
    category: "voting",
  },
  {
    id: "voting-11",
    question: "What prevents screenshot leaks of the ballot?",
    answer:
      "The demo encourages kiosk setups; production deployments add watermarking, session timers, and hardware restrictions to protect ballot secrecy.",
    keywords: ["screenshot", "ballot secrecy", "kiosk"],
    category: "security",
  },
  {
    id: "voting-12",
    question: "How does ZKP help remote voting?",
    answer:
      "Voters can submit proofs from their vault to remote authorities, letting them confirm eligibility without exposing full ID documents online.",
    keywords: ["remote voting", "eligibility", "online"],
    category: "voting",
  },
  {
    id: "voting-13",
    question: "What is a confidential score after selfie capture?",
    answer:
      "The confidential score highlights how sensitive biometric data is; high scores signal that data should remain hashed and never shared openly.",
    keywords: ["confidential score", "biometric"],
    category: "security",
  },
  {
    id: "voting-14",
    question: "How do we handle offline polling stations?",
    answer:
      "Stations can collect votes locally, store proofs on secure hardware, and batch upload when connectivity returns, maintaining proof integrity.",
    keywords: ["offline", "batch upload", "station"],
    category: "governance",
  },
  {
    id: "voting-15",
    question: "Can observers verify voting proofs?",
    answer:
      "Yes, observers can check published proofs and block hashes through a transparency portal without learning which voter cast each ballot.",
    keywords: ["observer", "transparency", "portal"],
    category: "governance",
  },
  {
    id: "security-1",
    question: "How do ZKPs mitigate phishing attacks?",
    answer:
      "Users prove compliance attributes without entering raw credentials on suspicious sites, reducing exposure during phishing attempts.",
    keywords: ["phishing", "mitigation", "credentials"],
    category: "security",
  },
  {
    id: "security-2",
    question: "Why use HTTPS checks in the Payment Checker?",
    answer:
      "HTTPS ensures TLS encryption; the checker flags non-HTTPS urls because they expose users to credential theft and man-in-the-middle attacks.",
    keywords: ["https", "payment checker", "tls"],
    category: "security",
  },
  {
    id: "security-3",
    question: "What is domain reputation scoring?",
    answer:
      "The checker uses heuristics like age, keywords, and TLD to rate risk, guiding users before they enter sensitive payment data.",
    keywords: ["domain reputation", "heuristics", "risk"],
    category: "security",
  },
  {
    id: "security-4",
    question: "Why is hashing important for biometric storage?",
    answer:
      "Hashing avoids storing raw images; even if hashes leak they cannot reconstruct the original biometric, reducing privacy impact.",
    keywords: ["hashing", "biometric", "storage"],
    category: "security",
  },
  {
    id: "security-5",
    question: "How are duplicate face attempts detected now?",
    answer:
      "The simplified flow logs a hash of the captured face; while it does not perform deep similarity checks, it still provides traceable receipts.",
    keywords: ["duplicate", "face hash", "logging"],
    category: "security",
  },
  {
    id: "security-6",
    question: "What are the limitations of client-side face checks?",
    answer:
      "Browser-based hashing is fast but sensitive to lighting changes; production systems combine it with backend verification or hardware tokens.",
    keywords: ["limitations", "client side", "face"],
    category: "security",
  },
  {
    id: "security-7",
    question: "How do ZKPs integrate with risk scoring?",
    answer:
      "Proofs can embed compliance metadata; risk engines add points for verified proofs and escalate reviews when proofs are missing or outdated.",
    keywords: ["risk scoring", "metadata", "compliance"],
    category: "compliance",
  },
  {
    id: "security-8",
    question: "How do we audit proof logs?",
    answer:
      "Proof events emit structured logs with timestamps, user IDs, and hashes; auditors can replay these logs to verify no tampering occurred.",
    keywords: ["audit", "logs", "tamper"],
    category: "security",
  },
  {
    id: "security-9",
    question: "What is confidentiality versus integrity?",
    answer:
      "Confidentiality protects data from exposure, while integrity ensures data hasn't been altered; ZKPs target both by sharing proofs instead of raw data.",
    keywords: ["confidentiality", "integrity", "difference"],
    category: "security",
  },
  {
    id: "security-10",
    question: "What is the role of entropy in hash generation?",
    answer:
      "High entropy in random seeds prevents predictable hashes, strengthening resistance against replay or collision attacks on proof records.",
    keywords: ["entropy", "hash generation", "collision"],
    category: "security",
  },
  {
    id: "security-11",
    question: "How do ZKPs handle revocation?",
    answer:
      "Proof systems include revocation registries or nullifiers so verifiers can reject proofs derived from revoked credentials in real time.",
    keywords: ["revocation", "nullifier", "registry"],
    category: "security",
  },
  {
    id: "security-12",
    question: "What is a compliance proof bundle?",
    answer:
      "A proof bundle packages the ZKP transcript, metadata, and verifier instructions, making it easy to email or scan without exposing secrets.",
    keywords: ["bundle", "transcript", "instructions"],
    category: "compliance",
  },
  {
    id: "security-13",
    question: "How are secrets stored securely on the client?",
    answer:
      "The app relies on browser memory during proof generation and clears state afterward; production would use secure elements or encrypted storage.",
    keywords: ["secret storage", "client", "secure element"],
    category: "security",
  },
  {
    id: "security-14",
    question: "How do we prevent replay attacks on proofs?",
    answer:
      "Proofs can include nonces or session IDs so even if intercepted they cannot be reused outside the intended verification flow.",
    keywords: ["replay attack", "nonce", "session"],
    category: "security",
  },
  {
    id: "security-15",
    question: "What is multi-party computation versus ZKP?",
    answer:
      "Multi-party computation jointly computes a result without revealing inputs; ZKP proves a result is correct after a computation is done.",
    keywords: ["mpc", "comparison", "difference"],
    category: "basics",
  },
  {
    id: "security-16",
    question: "How does the SafePay extension alert users?",
    answer:
      "It injects a banner on suspicious pages, listens for risky button clicks, and displays contextual warnings before credentials are submitted.",
    keywords: ["safepay", "extension", "alert"],
    category: "security",
  },
  {
    id: "security-17",
    question: "Why do we whitelist localhost in the extension?",
    answer:
      "During development we trust local environments; whitelisting prevents false alarms while testing demos on trusted domains.",
    keywords: ["whitelist", "localhost", "development"],
    category: "security",
  },
  {
    id: "security-18",
    question: "How are fake links detected?",
    answer:
      "The extension searches for keywords like update, verify, or free-prize, and checks button URLs for mismatched hosts before alerting the user.",
    keywords: ["fake link", "keyword", "alert"],
    category: "security",
  },
  {
    id: "security-19",
    question: "What is the difference between block hash and transaction hash?",
    answer:
      "Block hashes summarize entire blocks, while transaction hashes identify individual operations; both help auditors trace data integrity.",
    keywords: ["block hash", "transaction hash", "difference"],
    category: "blockchain",
  },
  {
    id: "security-20",
    question: "How do we encourage proof-first workflows?",
    answer:
      "UI nudges, tooltips, and disabled share buttons guide users to generate proofs before sharing credentials, keeping sensitive PDFs private.",
    keywords: ["proof first", "nudge", "ui"],
    category: "security",
  },
  {
    id: "analytics-1",
    question: "What metrics appear on the analytics dashboard?",
    answer:
      "Key metrics include total ballots, verified proofs, registered documents, and voter turnout with interactive charts and tickers.",
    keywords: ["metrics", "analytics dashboard", "charts"],
    category: "analytics",
  },
  {
    id: "analytics-2",
    question: "How are participation charts calculated?",
    answer:
      "Mock data simulates turnout per constituency; the bar chart aggregates votes cast versus eligible voters to show realistic participation rates.",
    keywords: ["participation", "bar chart", "mock data"],
    category: "analytics",
  },
  {
    id: "analytics-3",
    question: "Why does the ticker keep moving?",
    answer:
      "The ticker mimics live election broadcasts, continuously cycling through party standings to create a dynamic, engaging analytics view.",
    keywords: ["ticker", "animation", "party standing"],
    category: "analytics",
  },
  {
    id: "analytics-4",
    question: "How can I customize analytics data?",
    answer:
      "Update the mock data file `mockData.ts` to adjust ballots, turnout, or proof counts; the charts automatically re-render with new figures.",
    keywords: ["customize", "mock data", "update"],
    category: "analytics",
  },
  {
    id: "analytics-5",
    question: "What libraries power the charts?",
    answer:
      "The dashboard uses Recharts for bar, area, and pie charts, combined with Tailwind styling and subtle CSS animations.",
    keywords: ["recharts", "library", "tailwind"],
    category: "analytics",
  },
  {
    id: "analytics-6",
    question: "How do I add new insight cards?",
    answer:
      "Extend the insights array in `Analytics.tsx` with additional objects; the UI maps over the list to render cards automatically.",
    keywords: ["insight cards", "extend", "array"],
    category: "analytics",
  },
  {
    id: "analytics-7",
    question: "Why do analytics use realistic fake data?",
    answer:
      "Realistic numbers help stakeholders visualize adoption, spot trends, and plan rollouts even before live integrations exist.",
    keywords: ["realistic", "fake data", "planning"],
    category: "analytics",
  },
  {
    id: "analytics-8",
    question: "Can the analytics dashboard connect to real APIs?",
    answer:
      "Yes, replace the mock data with API calls and feed responses into the same chart components to surface live stats.",
    keywords: ["api", "integration", "real data"],
    category: "analytics",
  },
  {
    id: "analytics-9",
    question: "How do I localize the analytics labels?",
    answer:
      "The language toggle broadcasts events; listen for `trustvault-language-change` in analytics to swap between English and Hindi labels.",
    keywords: ["localize", "analytics", "language"],
    category: "analytics",
  },
  {
    id: "analytics-10",
    question: "What is integrity snapshot in analytics?",
    answer:
      "The integrity snapshot summarizes proof success rates, flagged documents, and compliance alerts, giving admins a quick risk overview.",
    keywords: ["integrity snapshot", "summary", "risk"],
    category: "analytics",
  },
  {
    id: "compliance-1",
    question: "How do ZKPs assist with AML checks?",
    answer:
      "They let institutions prove customers passed AML screening without exposing watchlist matches, balancing compliance and privacy.",
    keywords: ["aml", "screening", "privacy"],
    category: "compliance",
  },
  {
    id: "compliance-2",
    question: "What documentation supports regulatory audits?",
    answer:
      "Maintain proof logs, block hashes, and credential metadata; auditors can trace every verification without needing raw underlying documents.",
    keywords: ["regulatory", "audit", "documentation"],
    category: "compliance",
  },
  {
    id: "compliance-3",
    question: "How are consent receipts captured?",
    answer:
      "When sharing a proof, TrustVault records the recipient, timestamp, and scope, forming a consent log that regulators can review.",
    keywords: ["consent", "receipt", "scope"],
    category: "compliance",
  },
  {
    id: "compliance-4",
    question: "Why are audit trails immutable?",
    answer:
      "Writing hashes to blockchain anchors prevents tampering; any alteration would change the recorded hash and be immediately detectable.",
    keywords: ["audit trail", "immutable", "tamper"],
    category: "compliance",
  },
  {
    id: "compliance-5",
    question: "How do you demonstrate data minimization?",
    answer:
      "Use proofs instead of PDFs and log only necessary metadata; during audits you show adherence to minimization by design.",
    keywords: ["data minimization", "audit", "design"],
    category: "compliance",
  },
  {
    id: "compliance-6",
    question: "What is selective revocation?",
    answer:
      "Selective revocation removes compromised credentials while keeping valid ones active, aided by revocation registries and ZKP membership proofs.",
    keywords: ["selective revocation", "registry", "compromised"],
    category: "compliance",
  },
  {
    id: "compliance-7",
    question: "How fast can verifiers check proofs?",
    answer:
      "Depending on the scheme, verification is milliseconds, letting border checkpoints, banks, or kiosks process citizens rapidly.",
    keywords: ["speed", "verification", "milliseconds"],
    category: "compliance",
  },
  {
    id: "compliance-8",
    question: "What happens if a proof fails verification?",
    answer:
      "The UI warns the verifier, the attempt is logged, and users must regenerate a proof or contact the issuer to resolve discrepancies.",
    keywords: ["failure", "regenerate", "discrepancy"],
    category: "compliance",
  },
  {
    id: "compliance-9",
    question: "How do multi-jurisdiction proofs work?",
    answer:
      "Credentials embed jurisdiction codes; proofs can show compliance with multiple regions by combining relevant constraints in one transcript.",
    keywords: ["multi jurisdiction", "constraint", "transcript"],
    category: "compliance",
  },
  {
    id: "compliance-10",
    question: "Can ZKPs support ESG reporting?",
    answer:
      "Organizations can prove metrics like sustainable sourcing percentages without disclosing supplier identities, helping ESG audits.",
    keywords: ["esg", "reporting", "sourcing"],
    category: "governance",
  },
  {
    id: "governance-1",
    question: "How do decentralized governance votes use ZKPs?",
    answer:
      "DAO members generate proofs tied to token holdings, preventing vote buying and preserving voter privacy while validating eligibility.",
    keywords: ["dao", "governance", "eligibility"],
    category: "governance",
  },
  {
    id: "governance-2",
    question: "What is quorum in a ZKP-enabled vote?",
    answer:
      "Quorum defines the minimum participation required; proofs can attest to quorum satisfaction without revealing which members voted.",
    keywords: ["quorum", "participation", "vote"],
    category: "governance",
  },
  {
    id: "governance-3",
    question: "How are results audited transparently?",
    answer:
      "Publish anonymized proofs, tallies, and block hashes so independent observers can verify the reported outcome matches submitted ballots.",
    keywords: ["audit", "results", "transparency"],
    category: "governance",
  },
  {
    id: "governance-4",
    question: "What is liquid democracy with ZKPs?",
    answer:
      "Voters delegate to representatives via encrypted commitments; ZKPs prove delegations are valid while final tallies remain verifiable.",
    keywords: ["liquid democracy", "delegation", "commitment"],
    category: "governance",
  },
  {
    id: "governance-5",
    question: "How do we prevent Sybil attacks in governance?",
    answer:
      "Require proofs bound to unique credentials or stake, ensuring participants represent real individuals or verified entities.",
    keywords: ["sybil", "prevention", "stake"],
    category: "security",
  },
  {
    id: "governance-6",
    question: "What is privacy-preserving tallying?",
    answer:
      "Votes are encrypted and aggregated; ZKPs confirm the final tally without revealing individual votes, protecting ballot secrecy.",
    keywords: ["tallying", "encrypted", "secrecy"],
    category: "governance",
  },
  {
    id: "governance-7",
    question: "How is delegation revoked?",
    answer:
      "Delegators submit a revocation proof that cancels previous delegation commitments, ensuring future votes revert to direct control.",
    keywords: ["delegation", "revocation", "control"],
    category: "governance",
  },
  {
    id: "governance-8",
    question: "What is attestations marketplace?",
    answer:
      "Issuers publish credentials, holders collect them, and verifiers consume proofs, forming a marketplace that values privacy-preserving attestations.",
    keywords: ["marketplace", "attestation", "holders"],
    category: "governance",
  },
  {
    id: "governance-9",
    question: "How is fairness ensured in committee votes?",
    answer:
      "ZKPs prove each committee member voted once and that the tally matches the encrypted ballots, eliminating bias or tampering.",
    keywords: ["committee", "fairness", "tamper"],
    category: "governance",
  },
  {
    id: "governance-10",
    question: "Can public observers check turnout without deanonymizing voters?",
    answer:
      "Yes, publish aggregate turnout proofs derived from credential counts, giving observers insight without exposing individual participation.",
    keywords: ["turnout", "observer", "aggregate"],
    category: "governance",
  },
  {
    id: "implementation-1",
    question: "What tooling helps build ZKP circuits?",
    answer:
      "Popular tooling includes Circom, Halo2, Noir, and Arkworks; they compile high-level logic into constraint systems for proof generation.",
    keywords: ["tooling", "circom", "halo2"],
    category: "implementation",
  },
  {
    id: "implementation-2",
    question: "What is a circuit constraint count?",
    answer:
      "It measures the number of arithmetic constraints; fewer constraints generally mean faster proof generation but may need more complex gadget design.",
    keywords: ["constraint count", "performance"],
    category: "implementation",
  },
  {
    id: "implementation-3",
    question: "How does witness generation affect performance?",
    answer:
      "Witness generation often dominates runtime; optimizing preprocessing, using wasm backends, or parallelizing steps can speed up proofs.",
    keywords: ["witness generation", "performance", "wasm"],
    category: "implementation",
  },
  {
    id: "implementation-4",
    question: "Why monitor proving key size?",
    answer:
      "Large proving keys increase memory usage and distribution complexity, so choosing efficient circuits keeps deployments manageable.",
    keywords: ["proving key size", "memory"],
    category: "implementation",
  },
  {
    id: "implementation-5",
    question: "What is circuit arithmetization?",
    answer:
      "Arithmetization converts logical statements into polynomial equations over finite fields, enabling algebraic verification of computations.",
    keywords: ["arithmetization", "polynomial", "finite field"],
    category: "implementation",
  },
  {
    id: "implementation-6",
    question: "How do lookup tables help circuits?",
    answer:
      "Lookup tables allow circuits to reference precomputed values, reducing constraint counts for operations like range checks or bit decompositions.",
    keywords: ["lookup table", "range check", "optimization"],
    category: "implementation",
  },
  {
    id: "implementation-7",
    question: "What is plonk?",
    answer:
      "Plonk is a universal SNARK that supports reusable setup parameters and efficient custom gates, making it popular for modular applications.",
    keywords: ["plonk", "universal", "snark"],
    category: "implementation",
  },
  {
    id: "implementation-8",
    question: "What is the role of FFTs in proving systems?",
    answer:
      "Fast Fourier Transforms speed up polynomial evaluations and interpolations, enabling efficient encoding of constraint systems.",
    keywords: ["fft", "polynomial", "encoding"],
    category: "implementation",
  },
  {
    id: "implementation-9",
    question: "Why is circuit reuse valuable?",
    answer:
      "Reusable circuits reduce development time; once a credential proof circuit is audited, it can support many teams with minimal changes.",
    keywords: ["reuse", "audited", "modular"],
    category: "implementation",
  },
  {
    id: "implementation-10",
    question: "How do you debug circuits?",
    answer:
      "Use witness dumps, constraint inspectors, and small test inputs to identify failing constraints before generating full proofs.",
    keywords: ["debug", "witness dump", "test input"],
    category: "implementation",
  },
  {
    id: "implementation-11",
    question: "What is a gadget in circuit design?",
    answer:
      "Gadgets are reusable circuit components like hash functions or signature verifiers that help compose complex proofs from standard blocks.",
    keywords: ["gadget", "component", "reuse"],
    category: "implementation",
  },
  {
    id: "implementation-12",
    question: "How does parallel proving work?",
    answer:
      "Proof generation tasks, especially witness computation, can be split across threads or workers, leveraging multi-core systems for speedups.",
    keywords: ["parallel", "multi core", "speedup"],
    category: "implementation",
  },
  {
    id: "implementation-13",
    question: "What is the difference between groth16 and plonk?",
    answer:
      "Groth16 requires a trusted setup per circuit but yields smaller proofs, while Plonk supports universal setups with slightly larger proofs.",
    keywords: ["groth16", "plonk", "difference"],
    category: "implementation",
  },
  {
    id: "implementation-14",
    question: "Why do we benchmark prover latency?",
    answer:
      "Latency impacts user experience; by measuring proof generation time we can tune circuits, hardware, or batching to meet SLA targets.",
    keywords: ["benchmark", "latency", "sla"],
    category: "implementation",
  },
  {
    id: "implementation-15",
    question: "What is poseidon hash?",
    answer:
      "Poseidon is a SNARK-friendly hash function optimized for low constraint counts, widely used in circuits for commitments and Merkle trees.",
    keywords: ["poseidon", "hash", "snark friendly"],
    category: "implementation",
  },
  {
    id: "implementation-16",
    question: "How does Noir simplify ZKP development?",
    answer:
      "Noir is a domain-specific language that compiles to different proof systems, helping developers write readable circuits with fewer pitfalls.",
    keywords: ["noir", "dsl", "compile"],
    category: "implementation",
  },
  {
    id: "implementation-17",
    question: "What are custom gates in Plonk?",
    answer:
      "Custom gates let developers pack multiple constraints into a single gate, reducing overhead for complex arithmetic or bit operations.",
    keywords: ["custom gate", "plonk", "optimization"],
    category: "implementation",
  },
  {
    id: "implementation-18",
    question: "Why track verifier costs?",
    answer:
      "Verifier costs determine on-chain gas fees or server budgets; optimizing them ensures large-scale deployments remain economical.",
    keywords: ["verifier cost", "gas", "budget"],
    category: "implementation",
  },
  {
    id: "implementation-19",
    question: "What is a universal setup?",
    answer:
      "A universal setup produces parameters usable across many circuits, simplifying deployment and reducing ceremony frequency.",
    keywords: ["universal setup", "parameters"],
    category: "implementation",
  },
  {
    id: "implementation-20",
    question: "How do you integrate ZKPs with APIs?",
    answer:
      "Expose endpoints that accept proof payloads, verify them using the chosen proving system, and respond with signed confirmations or error codes.",
    keywords: ["api", "integration", "verification"],
    category: "implementation",
  },
];



