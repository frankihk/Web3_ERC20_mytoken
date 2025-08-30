import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0xd2E83D3b915fa829c5c61c463721FFF2Bc9C09Cf';
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function mint(address to, uint256 amount)'
];

export default function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider>();
  const [signer, setSigner] = useState<ethers.Signer>();
  const [account, setAccount] = useState<string>('');
  const [tokenName, setTokenName] = useState('');
  const [totalSupply, setTotalSupply] = useState('0');
  const [decimals, setDecimals] = useState(18);

  useEffect(() => {
    if (!signer) return;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC20_ABI, signer);
    async function load() {
      const [name, supply, dec] = await Promise.all([
        contract.name(),
        contract.totalSupply(),
        contract.decimals()
      ]);
      setTokenName(name);
      setDecimals(dec);
      setTotalSupply(ethers.formatUnits(supply, dec));
      const addr = await signer.getAddress();
      setAccount(addr);
    }
    load();
  }, [signer]);

  const connect = async () => {
    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send('eth_requestAccounts', []);
      const signer = await browserProvider.getSigner();
      setProvider(browserProvider);
      setSigner(signer);
    }
  };

  const mint = async () => {
    if (!signer) return;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC20_ABI, signer);
    const tx = await contract.mint(account, ethers.parseUnits('1', decimals));
    await tx.wait();
    const supply = await contract.totalSupply();
    setTotalSupply(ethers.formatUnits(supply, decimals));
  };

  return (
    <div>
      <h1>ERC20 Dashboard</h1>
      {account ? (
        <div>
          <p>Connected as {account}</p>
          <p>Token: {tokenName}</p>
          <p>Total Supply: {totalSupply}</p>
          <button onClick={mint}>Mint 1 Token</button>
        </div>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
