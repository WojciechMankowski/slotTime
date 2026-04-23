import { useState } from "react";
import { reserveSlot, NoticePayload } from "../API/serviceSlot";
import { getApiError } from "../Helper/helper";
import { t, Lang } from "../Helper/i18n";
import type { Slot } from "../Types/SlotType";

const emptyForm: NoticePayload = {
  numer_zlecenia: "",
  referencja: "",
  rejestracja_auta: "",
  rejestracja_naczepy: "",
  ilosc_palet: 1,
  kierowca_imie_nazwisko: "",
  kierowca_tel: "",
  uwagi: "",
};

export default function useReservation(lang: Lang, onSuccess: (slot: Slot) => void) {
  const [confirmSlot, setConfirmSlot] = useState<Slot | null>(null);
  const [requestedType, setRequestedType] = useState<"INBOUND" | "OUTBOUND">("INBOUND");
  const [reserving, setReserving] = useState(false);
  const [reserveErr, setReserveErr] = useState<string | null>(null);
  const [form, setForm] = useState<NoticePayload>({ ...emptyForm });
  const [errors, setErrors] = useState<Partial<Record<keyof NoticePayload, string>>>({});

  const open = (slot: Slot) => {
    setConfirmSlot(slot);
    setReserveErr(null);
    setRequestedType("INBOUND");
    setForm({ ...emptyForm });
    setErrors({});
  };

  const close = () => setConfirmSlot(null);

  const clearError = (field: keyof NoticePayload) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const confirm = async () => {
    if (!confirmSlot) return;

    // Walidacja pól awizacji
    const errs: Partial<Record<keyof NoticePayload, string>> = {};
    const req = t("notice_required_field", lang);

    if (!form.numer_zlecenia.trim()) errs.numer_zlecenia = req;
    if (!form.referencja.trim()) errs.referencja = req;
    if (!form.rejestracja_auta.trim()) errs.rejestracja_auta = req;
    if (!form.rejestracja_naczepy.trim()) errs.rejestracja_naczepy = req;
    if (!form.ilosc_palet || form.ilosc_palet <= 0)
      errs.ilosc_palet = t("notice_pallets_positive", lang);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setReserveErr(null);
    setReserving(true);
    try {
      const payload = {
        ...(confirmSlot.slot_type === "ANY" ? { requested_type: requestedType } : {}),
        numer_zlecenia: form.numer_zlecenia,
        referencja: form.referencja,
        rejestracja_auta: form.rejestracja_auta,
        rejestracja_naczepy: form.rejestracja_naczepy,
        ilosc_palet: form.ilosc_palet,
        kierowca_imie_nazwisko: form.kierowca_imie_nazwisko || undefined,
        kierowca_tel: form.kierowca_tel || undefined,
        uwagi: form.uwagi || undefined,
      };
      const reserved = await reserveSlot(confirmSlot.id, payload);
      setConfirmSlot(null);
      onSuccess(reserved);
    } catch (err) {
      setReserveErr(getApiError(err));
    } finally {
      setReserving(false);
    }
  };

  return {
    confirmSlot,
    requestedType,
    reserving,
    reserveErr,
    form,
    errors,
    open,
    close,
    confirm,
    setRequestedType,
    setForm,
    clearError,
  };
}
