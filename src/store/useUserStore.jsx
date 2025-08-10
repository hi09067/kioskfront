// src/store/useUserStore.jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialState = {
  nickName: '',
  viewDate: '',
  // Demographic
  gender: '',
  age: '',
  region: '',
  income: '',
  reasons: [],       // 관람 이유(복수 선택)
  customReason: '',  // '기타' 입력값
};

const useUserStore = create(
  persist(
    function (set, get) {
      return {
        ...initialState,

        // 기존 API
        setNickName: function (nickName) { set({ nickName }); },
        setViewDate: function (viewDate) { set({ viewDate }); },

        // 개별 Setter
        setGender: function (gender) { set({ gender }); },
        setAge: function (age) { set({ age }); },
        setRegion: function (region) { set({ region }); },
        setIncome: function (income) { set({ income }); },
        setReasons: function (reasons) {
          set({ reasons: Array.isArray(reasons) ? reasons : [] });
        },
        addReason: function (reason) {
          const curr = get().reasons || [];
          if (!curr.includes(reason)) set({ reasons: [...curr, reason] });
        },
        removeReason: function (reason) {
          const curr = get().reasons || [];
          set({ reasons: curr.filter(r => r !== reason) });
        },
        toggleReason: function (reason) {
          const curr = get().reasons || [];
          set({
            reasons: curr.includes(reason)
              ? curr.filter(r => r !== reason)
              : [...curr, reason],
          });
        },
        setCustomReason: function (customReason) { set({ customReason }); },

        // 묶음 Setter (formData/체크박스 한번에 반영 가능)
        setDemographics: function (payload = {}) {
          const next = {};
          if (payload.nickname !== undefined) next.nickName = payload.nickname; // 폼의 nickname → store nickName
          if (payload.gender !== undefined) next.gender = payload.gender;
          if (payload.age !== undefined) next.age = payload.age;
          if (payload.region !== undefined) next.region = payload.region;
          if (payload.income !== undefined) next.income = payload.income;
          if (payload.reasons !== undefined) next.reasons = Array.isArray(payload.reasons) ? payload.reasons : [];
          if (payload.customReason !== undefined) next.customReason = payload.customReason;
          set(next);
        },

        // Reset
        resetDemographics: function () {
          set({
            gender: '',
            age: '',
            region: '',
            income: '',
            reasons: [],
            customReason: '',
          });
        },
        resetUser: function () {
          set({ ...initialState });
        },
      };
    },
    {
      name: 'user-storage',
      partialize: (state) => ({
        nickName: state.nickName,
        viewDate: state.viewDate,
        gender: state.gender,
        age: state.age,
        region: state.region,
        income: state.income,
        reasons: state.reasons,
        customReason: state.customReason,
      }),
    }
  )
);

export default useUserStore;
