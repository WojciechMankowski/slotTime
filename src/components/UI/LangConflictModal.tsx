import React from "react";
import { t, Lang } from "../../Helper/i18n";
import Overlay from "./Overlay";

interface LangConflictModalProps {
  local: Lang;
  account: Lang;
  lang: Lang;
  onChoose: (chosen: Lang) => void;
}

const flagSrc = (l: Lang) =>
  l === "pl" ? "https://flagcdn.com/w20/pl.png" : "https://flagcdn.com/w20/gb.png";

export default function LangConflictModal({
  local,
  account,
  lang,
  onChoose,
}: LangConflictModalProps) {
  const Option = ({ value, sublabel }: { value: Lang; sublabel: string }) => (
    <button
      type="button"
      onClick={() => onChoose(value)}
      className="flex-1 flex flex-col items-center gap-2 px-4 py-4 rounded-xl border border-(--border) bg-white hover:border-blue-600 hover:bg-blue-50/40 transition-all"
    >
      <img src={flagSrc(value)} alt={value.toUpperCase()} width="28" />
      <span className="font-semibold text-(--text-main)">
        {t(value === "pl" ? "lang_pl" : "lang_en", lang)}
      </span>
      <span className="text-xs text-gray-500">{sublabel}</span>
    </button>
  );

  return (
    <Overlay onClose={() => onChoose(account)}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-br from-blue-600 to-blue-800 px-7 py-5">
          <h3 className="text-xl font-bold text-white mb-0">
            {t("lang_conflict_title", lang)}
          </h3>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          <p className="text-gray-500 text-sm mb-6">{t("lang_conflict_desc", lang)}</p>
          <div className="flex gap-3">
            <Option value={local} sublabel={t("lang_keep_browser", lang)} />
            <Option value={account} sublabel={t("lang_keep_account", lang)} />
          </div>
        </div>
      </div>
    </Overlay>
  );
}
