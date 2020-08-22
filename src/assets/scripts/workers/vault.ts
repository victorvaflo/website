import { expose } from "threads/worker";
import { VaultInterface } from "community-js/lib/faces";

const worker = {
  meVsOthersBalances: (v: VaultInterface, address: string) => {
    const vaultUsers = Object.keys(v);
    let me = 0;
    let others = 0;
    for(let i = 0, j = vaultUsers.length; i < j; i++) {
      if(vaultUsers[i] === address) {
        me += v[vaultUsers[i]].map(a => a.balance).reduce((a, b) => a + b, 0);
      } else {
        others += v[vaultUsers[i]].map(a => a.balance).reduce((a, b) => a + b, 0);
      }
    }

    return {me, others};
  }, 
  meVsOthersWeight: (v: VaultInterface, address: string) => {
    const vaultUsers = Object.keys(v);
    let me = 0;
    let others = 0;
    for(let i = 0, j = vaultUsers.length; i < j; i++) {
      if(vaultUsers[i] === address) {
        me += v[vaultUsers[i]].map(a => a.balance * (a.end - a.start)).reduce((a, b) => a + b, 0);
      } else {
        others += v[vaultUsers[i]].map(a => a.balance * (a.end - a.start)).reduce((a, b) => a + b, 0);
      }
    }

    return {me, others};
  },
  totalVaults: (v: VaultInterface, currentHeight: number) => {
    const vaultUsers = Object.keys(v);

    const users: {[key: string]: {weight: number, balance: number}} = {};
    for(let i = 0, j = vaultUsers.length; i < j; i++) {
      let balance = 0;
      let weight = 0;

      for(let k = 0, l = vaultUsers[i].length; k < l; k++) {
        const vault = v[vaultUsers[i]][k];
        if(!vault || vault.end < currentHeight) {
          continue;
        }

        balance += vault.balance;
        weight += (vault.end - vault.start) * vault.balance;
      }

      if(users[vaultUsers[i]]) {
        users[vaultUsers[i]].balance += balance;
        users[vaultUsers[i]].weight += weight;
      } else {
        users[vaultUsers[i]] = {balance, weight};
      }
    }

    return users;
  }
}

export type VaultWorker = typeof worker;
expose(worker);