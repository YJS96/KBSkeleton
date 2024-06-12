import { defineStore } from 'pinia';
import { reactive, computed } from 'vue';
import axios from 'axios';
import moment from 'moment';

export const useUserInfoStore = defineStore('userInfo', () => {
  const BASEURL = '/api/user';
  const state = reactive({
    userInfo: [],
  });

  const fetchuserInfo = async () => {
    try {
      const response = await axios.get(BASEURL);
      state.userInfo = await response.data;
    } catch (err) {
      // console.log(err);
    }
  };

  const userInfo = computed(() => state.userInfo);

  return { fetchuserInfo, userInfo };
});

export const useHistoryStore = defineStore('history', () => {
  const BASEURL = '/api/history';
  const state = reactive({
    historyList: [],
  });

  // 리스트 받아오기
  const fetchHistory = async () => {
    try {
      const response = await axios.get(BASEURL);
      state.historyList = await response.data;
    } catch (err) {
      // console.log(err);
    }
  };

  // 내역 추가
  const postHistory = async (obj) => {
    try {
      const response = await axios.post(BASEURL, obj);
      console.log(response);
      fetchHistory();
    } catch (err) {
      console.log(err);
    }
  };

  // 월 전체 수입
  const totalIncomeByMonth = (month) => {
    const targetMonth = String(month).padStart(2, '0');
    const incomeList = state.historyList.filter((history) => moment(history.date).format('MM') === targetMonth && history.type === 'income');

    return incomeList.reduce((sum, history) => sum + Number(history.amount), 0);
  };

  // 월 전체 지출
  const totalOutcomeByMonth = (month) => {
    const targetMonth = String(month).padStart(2, '0');
    const incomeList = state.historyList.filter((history) => moment(history.date).format('MM') === targetMonth && history.type === 'outcome');

    return incomeList.reduce((sum, history) => sum + Number(history.amount), 0);
  };

  // 월 최근 5개 내역
  const recentHistoryByMonth = (month) => {
    const targetMonth = String(month).padStart(2, '0');
    const filteredHistory = state.historyList.filter((history) => moment(history.date).format('MM') === targetMonth);

    const sortedHistory = filteredHistory.sort((a, b) => moment(b.date).diff(moment(a.date)));

    return sortedHistory.slice(0, 5);
  };

  // 월 단일 최대 금액
  const maxOutcomeByMonth = (month) => {
    const targetMonth = String(month).padStart(2, '0');
    const filteredOutcome = state.historyList.filter((history) => moment(history.date).format('MM') === targetMonth && history.type === 'outcome');

    if (filteredOutcome.length === 0) {
      return null;
    }

    const maxOutcome = filteredOutcome.reduce((max, history) => (history.amount > max.amount ? history : max));

    return maxOutcome;
  };

  // 가장 많은 지출처
  const mostFrequentMemoByMonth = (month) => {
    const targetMonth = String(month).padStart(2, '0');
    const filteredOutcome = state.historyList.filter((history) => moment(history.date).format('MM') === targetMonth && history.type === 'outcome');

    if (filteredOutcome.length === 0) {
      return null;
    }

    const memoCount = filteredOutcome.reduce((count, history) => {
      const { memo } = history;
      count[memo] = (count[memo] || 0) + 1;
      return count;
    }, {});

    const maxCount = Math.max(...Object.values(memoCount));
    const mostFrequentMemo = Object.keys(memoCount).find((memo) => memoCount[memo] === maxCount);

    return mostFrequentMemo;
  };

  // 가장 많은 카테고리
  const mostFrequentCategoryByMonth = (month) => {
    const targetMonth = String(month).padStart(2, '0');
    const filteredOutcome = state.historyList.filter((history) => moment(history.date).format('MM') === targetMonth && history.type === 'outcome');

    if (filteredOutcome.length === 0) {
      return null;
    }

    const categoryCount = filteredOutcome.reduce((count, history) => {
      const { category } = history;
      count[category] = (count[category] || 0) + 1;
      return count;
    }, {});

    const maxCount = Math.max(...Object.values(categoryCount));
    const mostFrequentCategory = Object.keys(categoryCount).find((category) => categoryCount[category] === maxCount);

    return mostFrequentCategory;
  };

  // 숫자 세개 단위 콤마
  const addComma = (val) => {
    return val.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
  };

  // 수입일 경우 + 기호, 지출일 경우 - 기호 + 콤마
  const addSymbolComma = (val, type) => {
    const newVal = val.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    if (type === 'income') {
      return `+${newVal}`;
    } else {
      return `-${newVal}`;
    }
  };
  fetchHistory();

  const historyList = computed(() => state.historyList);

  return {
    historyList,
    postHistory,
    addComma,
    addSymbolComma,
    fetchHistory,
    totalIncomeByMonth,
    totalOutcomeByMonth,
    recentHistoryByMonth,
    maxOutcomeByMonth,
    mostFrequentMemoByMonth,
    mostFrequentCategoryByMonth,
  };
});
