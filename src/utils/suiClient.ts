import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { fromB64 } from "@mysten/sui/utils";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import dotenv from "dotenv";

dotenv.config();

const SUI_RPC_URL = process.env.SUI_RPC_URL || getFullnodeUrl("testnet");
const SUI_PRIVATE_KEY = process.env.SUI_PRIVATE_KEY!;
const SUI_PACKAGE_ID = process.env.SUI_PACKAGE_ID!;
const SUI_REGISTRY_ID = process.env.SUI_REGISTRY_ID!;
const SUI_ADMIN_CAP_ID = process.env.SUI_ADMIN_CAP_ID!;
const SUI_INSTITUTION_CAP_ID = process.env.SUI_INSTITUTION_CAP_ID!;

// Initialize SUI client
const suiClient = new SuiClient({ url: SUI_RPC_URL });

// Initialize keypair from private key (handle different formats)
let keypair: Ed25519Keypair;
try {
  if (SUI_PRIVATE_KEY.startsWith('suiprivkey1')) {
    // Bech32 format - use decodeSuiPrivateKey
    const { secretKey } = decodeSuiPrivateKey(SUI_PRIVATE_KEY);
    keypair = Ed25519Keypair.fromSecretKey(secretKey);
  } else if (SUI_PRIVATE_KEY.startsWith('0x')) {
    // Hex format - remove 0x prefix and convert
    const hexKey = SUI_PRIVATE_KEY.slice(2);
    keypair = Ed25519Keypair.fromSecretKey(Uint8Array.from(Buffer.from(hexKey, 'hex')));
  } else {
    // Assume Base64 format
    keypair = Ed25519Keypair.fromSecretKey(fromB64(SUI_PRIVATE_KEY));
  }
} catch (error) {
  console.error('Failed to initialize keypair:', error);
  console.error('Private key format:', SUI_PRIVATE_KEY.substring(0, 20) + '...');
  throw new Error('Invalid SUI_PRIVATE_KEY format. Please check your private key.');
}

export interface ResultData {
  studentId: string;
  courseCode: string;
  grade: string;
  semester: string;
}

export async function addResult(data: ResultData) {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::result_registry_v2::add_result_entry`,
      arguments: [
        tx.object(SUI_INSTITUTION_CAP_ID),
        tx.object(SUI_REGISTRY_ID),
        tx.pure.string(data.studentId),
        tx.pure.string(data.courseCode),
        tx.pure.string(data.grade),
        tx.pure.string(data.semester),
        tx.object('0x6'), // Clock object ID
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    return result;
  } catch (error) {
    console.error('SUI add result error:', error);
    throw error;
  }
}

export async function getResult(studentId: string, courseCode: string, semester: string) {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::result_registry_v2::get_result`,
      arguments: [
        tx.object(SUI_REGISTRY_ID),
        tx.pure.string(studentId),
        tx.pure.string(courseCode),
        tx.pure.string(semester),
      ],
    });

    const result = await suiClient.devInspectTransactionBlock({
      sender: keypair.getPublicKey().toSuiAddress(),
      transactionBlock: tx,
    });

    return result;
  } catch (error) {
    console.error('SUI get result error:', error);
    throw error;
  }
}

export async function verifyResult(studentId: string, courseCode: string, semester: string) {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::result_registry_v2::verify_result_entry`,
      arguments: [
        tx.object(SUI_INSTITUTION_CAP_ID),
        tx.object(SUI_REGISTRY_ID),
        tx.pure.string(studentId),
        tx.pure.string(courseCode),
        tx.pure.string(semester),
        tx.object('0x6'), // Clock object ID
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    return result;
  } catch (error) {
    console.error('SUI verify result error:', error);
    throw error;
  }
}

export async function updateGrade(studentId: string, courseCode: string, semester: string, newGrade: string) {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::result_registry_v2::update_grade_entry`,
      arguments: [
        tx.object(SUI_INSTITUTION_CAP_ID),
        tx.object(SUI_REGISTRY_ID),
        tx.pure.string(studentId),
        tx.pure.string(courseCode),
        tx.pure.string(semester),
        tx.pure.string(newGrade),
        tx.object('0x6'), // Clock object ID
      ],
    });

    const result = await suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    return result;
  } catch (error) {
    console.error('SUI update grade error:', error);
    throw error;
  }
}

export async function checkResultExists(studentId: string, courseCode: string, semester: string) {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::result_registry_v2::result_exists`,
      arguments: [
        tx.object(SUI_REGISTRY_ID),
        tx.pure.string(studentId),
        tx.pure.string(courseCode),
        tx.pure.string(semester),
      ],
    });

    const result = await suiClient.devInspectTransactionBlock({
      sender: keypair.getPublicKey().toSuiAddress(),
      transactionBlock: tx,
    });

    return result;
  } catch (error) {
    console.error('SUI check result exists error:', error);
    throw error;
  }
}

export async function isResultVerified(studentId: string, courseCode: string, semester: string) {
  try {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${SUI_PACKAGE_ID}::result_registry_v2::is_result_verified`,
      arguments: [
        tx.object(SUI_REGISTRY_ID),
        tx.pure.string(studentId),
        tx.pure.string(courseCode),
        tx.pure.string(semester),
      ],
    });

    const result = await suiClient.devInspectTransactionBlock({
      sender: keypair.getPublicKey().toSuiAddress(),
      transactionBlock: tx,
    });

    return result;
  } catch (error) {
    console.error('SUI is result verified error:', error);
    throw error;
  }
}

export { suiClient, keypair };
