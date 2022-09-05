import {
  TypedDataDomain,
  TypedDataField,
} from "@ethersproject/abstract-signer";
import { ethers, utils } from "ethers";
import { omit } from "./helpers";

let signer: ethers.providers.JsonRpcSigner;
let address: string;

export const setSigner = async (_signer: ethers.providers.JsonRpcSigner) => {
  signer = _signer;
  address = await signer.getAddress();
};

export const setAddress = async (_address: string) => {
  address = _address;
};

export const getSigner = () => {
  return signer;
};

export const getAddressFromSigner = () => {
  return address;
};

export const signedTypeData = (
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, any>
) => {
  const signer = getSigner();
  // remove the __typedname from the signature!
  return signer._signTypedData(
    omit(domain, "__typename"),
    omit(types, "__typename"),
    omit(value, "__typename")
  );
};

export const splitSignature = (signature: string) => {
  return utils.splitSignature(signature);
};

export const sendTx = (
  transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>
) => {
  const signer = getSigner();
  return signer.sendTransaction(transaction);
};

export const signText = (text: string) => {
  return getSigner().signMessage(text);
};
