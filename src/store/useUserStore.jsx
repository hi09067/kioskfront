// src/store/useUserStore.jsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// persist 사용 + 일반 함수 방식으로 구현
const useUserStore = create(
  persist(
    function (set) {
      return {
        nickName: '',
        viewDate: '',

        setNickName: function (nickName) {
          set({ nickName });
        },

        setViewDate: function (viewDate) {
          set({ viewDate });
        },

        resetUser: function () {
          set({
            nickName: '',
            viewDate: '',
          });
        },
      };
    },
    {
      name: 'user-storage', // localStorage에 저장될 키 이름
      partialize: (state) => ({
        nickName: state.nickName,
        viewDate: state.viewDate,
      }),
    }
  )
);

export default useUserStore;
