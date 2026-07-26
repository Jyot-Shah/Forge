import React from "react";

export const FORGE_LOGO_URL =
  "https://lh3.googleusercontent.com/aida/AP1WRLsGJPCNxfTxmvtI4cvfkIb1lf_Yz5yS10bGKR7MW9Ec2zt5x8gHxtXDZXBjsi4CF9RGxZuNdC5GbhU-xjMRzVxtQVeHbgQtQVTvsDDieu5a9lQmEZnCtqqienrTohLvtnuEdNDTEiQhxPo7aV7J5_IXDdpKDp-VoUNfBrrY2AdMLyGiZcRLwzoUPlkgdAOaL05TpF5-yxov0pnF9L-MsspwpX-7FS53E3WTsBRHKR1AfMAsDg_f8ky-uJUi";

export default function ForgeLogo({ className = "w-8 h-8" }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-DEFAULT bg-surface-container-highest border border-outline-variant/60 shrink-0 ${className}`}
    >
      <img
        src={FORGE_LOGO_URL}
        alt="Forge Logo"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          if (e.currentTarget.nextSibling) {
            e.currentTarget.nextSibling.style.display = "flex";
          }
        }}
      />
      <div
        className="w-full h-full items-center justify-center bg-primary text-on-primary font-mono-label font-bold text-xs"
        style={{ display: "none" }}
      >
        F
      </div>
    </div>
  );
}
