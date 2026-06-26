import React, { useState, useEffect } from "react";
import Input from "../UI/Input";
import Select from "../UI/Select";
import Button from "../UI/Button";
import Label from "../UI/Label";
import { FormProps, SlotFormData } from "../../Types/Props";
import { createSlot } from "../../API/serviceSlot";
import { t, getLang } from "../../Helper/i18n";

const SlotForm: React.FC<FormProps> = ({
  serverError,
}) => {
  const defaultData: SlotFormData = {
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    slotType: "INBOUND",
    quantity: 1,
    interval: 30,
  };

  const [dataForm, setFormData] = useState<SlotFormData>(defaultData);
  const [skipWeekends, setSkipWeekends] = useState(false);
  const [errors, setErrors] = useState<{
    [key in keyof SlotFormData]?: string;
  }>({});
  
  const handleValueChange = (value: string | number, name?: string) => {
    if (!name) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key in keyof SlotFormData]?: string } = {};

    if (!dataForm.date) {
      newErrors.date = t('date_required', getLang());
    }

    if (!dataForm.startTime) {
      newErrors.startTime = t('start_time_required', getLang());
    }

    if (!dataForm.endTime) {
      newErrors.endTime = t('end_time_required', getLang());
    } 
    if (!dataForm.slotType) {
      newErrors.slotType = t('slot_type_required', getLang());
    }
    if (!dataForm.quantity || dataForm.quantity < 1) {
      newErrors.quantity = t('slot_quantity_required', getLang());
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    createSlot(dataForm.date, dataForm.startTime, dataForm.endTime, dataForm.slotType, dataForm.interval, dataForm.quantity, skipWeekends)
  };

  return (
    <div className="slot-form-card">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
               <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                 {t('date', getLang())}
               </label>
               <input
                  type="date"
                  value={dataForm.date}
                  className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  onChange={(e) => handleValueChange(e.target.value, "date")}
              />
              {errors.date && <p className="text-red-500 text-[0.7rem] font-bold mt-1">{errors.date}</p>}
            </div>

            <label className="flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-300 bg-gray-50 cursor-pointer select-none hover:bg-gray-100 transition-colors shrink-0">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                checked={skipWeekends}
                onChange={(e) => setSkipWeekends(e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">{t('skip_weekends', getLang())}</span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('start_time', getLang())}
            </label>
            <input
                type="time"
                value={dataForm.startTime}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => handleValueChange(e.target.value, "startTime")}
            />
            {errors.startTime && <p className="text-red-500 text-[0.7rem] font-bold mt-1">{errors.startTime}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('end_time', getLang())}
            </label>
            <input
                type="time"
                value={dataForm.endTime}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => handleValueChange(e.target.value, "endTime")}
            />
            {errors.endTime && <p className="text-red-500 text-[0.7rem] font-bold mt-1">{errors.endTime}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('type', getLang())}
            </label>
            <select
                value={dataForm.slotType}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                onChange={(e) => handleValueChange(e.target.value, "slotType")}
            >
              <option value="INBOUND">{t('inbound', getLang())}</option>
              <option value="OUTBOUND">{t('outbound', getLang())}</option>
              <option value="ANY">{t('any', getLang())}</option>
            </select>
            {errors.slotType && <p className="text-red-500 text-[0.7rem] font-bold mt-1">{errors.slotType}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('slot_count', getLang())}
            </label>
            <input
                type="number"
                min={1}
                value={dataForm.quantity}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => handleValueChange(parseInt(e.target.value) || 1, "quantity")}
            />
            {errors.quantity && <p className="text-red-500 text-[0.7rem] font-bold mt-1">{errors.quantity}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {t('interval_minutes', getLang())}
            </label>
            <select
                value={dataForm.interval}
                className="border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                onChange={(val)  => handleValueChange(parseInt(val.target.value), "interval")}
            >
              {[30, 60, 90, 120].map(v => (
                <option key={v} value={v}>{v} min</option>
              ))}
            </select>
            {errors.interval && <p className="text-red-500 text-[0.7rem] font-bold mt-1">{errors.interval}</p>}
          </div>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {serverError}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full md:w-fit min-w-[180px] bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('create_slots', getLang())}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SlotForm;
