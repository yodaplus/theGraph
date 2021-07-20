import { BigInt } from "@graphprotocol/graph-ts"
import {
  Contract,
  MinterAdded,
  MinterRemoved,
  Transfer,
  Approval,
  ApprovalForAll
} from "../generated/Contract/Contract"
import { Account, NFT, ApprovalTransaction, TransferTransaction } from "../generated/schema"

export function handleMinterAdded(event: MinterAdded): void {
  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.supportsInterface(...)
  // - contract.name(...)
  // - contract.getApproved(...)
  // - contract.totalSupply(...)
  // - contract.tokenOfOwnerByIndex(...)
  // - contract.mint(...)
  // - contract.tokenByIndex(...)
  // - contract.ownerOf(...)
  // - contract.balanceOf(...)
  // - contract.symbol(...)
  // - contract.isMinter(...)
  // - contract.tokenURI(...)
  // - contract.isApprovedForAll(...)
}

export function handleMinterRemoved(event: MinterRemoved): void {}

export function handleTransfer(event: Transfer): void {
  let transferTx = new TransferTransaction(event.transaction.hash.toHexString());
  transferTx.from = event.params.from;
  transferTx.to = event.params.to;
  transferTx.tokenID = event.params.tokenId;
  transferTx.save();

  let contract = Contract.bind(event.address);

  let nftID = event.params.tokenId.toHexString();
  let nft = NFT.load(nftID);
  if (nft == null) {
    nft = new NFT(nftID);
    nft.tokenID = event.params.tokenId;
    nft.owner = event.params.to;
    nft.tokenURI = contract.tokenURI(event.params.tokenId);
  }

  nft.owner = event.params.to;
  nft.save();

  let fromAccount = Account.load(event.params.from.toHexString());
  if (fromAccount == null) {
    fromAccount = new Account(event.params.from.toHexString());
    fromAccount.address = event.params.from;
    fromAccount.balance = new BigInt(1);
  }
  let bigIntOne = new BigInt(1);
  fromAccount.balance = fromAccount.balance.plus(bigIntOne);
  fromAccount.save();

  let toAccount = Account.load(event.params.to.toHexString());
  if (toAccount == null) {
    toAccount = new Account(event.params.to.toHexString());
    toAccount.address = event.params.to;
    toAccount.balance = new BigInt(1);
  }
  toAccount.balance = fromAccount.balance.minus(bigIntOne);
  toAccount.save();

}

export function handleApproval(event: Approval): void {
  let approvalTx = new ApprovalTransaction(event.transaction.hash.toHexString());
  approvalTx.owner = event.params.owner;
  approvalTx.approvedTo = event.params.approved;
  approvalTx.tokenID = event.params.tokenId;

  approvalTx.save();
}

export function handleApprovalForAll(event: ApprovalForAll): void {}
