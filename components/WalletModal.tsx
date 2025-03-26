import Modal from "./modal.component";

type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (walletId: string) => void;
};

const WalletModal = ({ isOpen, onClose, onSelect }: WalletModalProps) => {
  const wallets = [
    {
      id: "leo-wallet",
      name: "Leo Wallet",
      icon: "/assets/LeoWallet.png",
    },
    {
      id: "puzzle-wallet",
      name: "Puzzle Wallet",
      icon: "/assets/PuzzleWallet.png",
    },
    {
      id: "soter-wallet",
      name: "Soter Wallet",
      icon: "/assets/SoterWallet.png",
    },
    {
      id: "fox-wallet",
      name: "Fox Wallet",
      icon: "/assets/FoxWallet.png",
    },
  ];
  return (
    <Modal close={onClose} open={isOpen} title="Connect Wallet">
      <div className="grid grid-cols-2 items-center justify-between flex-row flex-wrap">
        {wallets.map((wallet) => {
          return (
            <button
              key={wallet.id}
              onClick={() => onSelect(wallet.id)}
              className="flex flex-col items-center justify-between w-full p-4  hover:bg-gray-200 rounded-md"
            >
              <div className="flex items-center gap-4 flex-col">
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  className="w-8 h-8 object-cover rounded-full"
                />
                <span>{wallet.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default WalletModal;
