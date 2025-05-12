import API from './axiosInstance';

//입추수수 등록
export const createChickEntry = async (chickEntryDto) => {
  try {
    console.log('Request:', chickEntryDto);

    const { data } = await API.post('/chickEntry', chickEntryDto);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('createChickEntry error:', err);
    // 필요하면 사용자용 메시지 가공 후 throw
    throw err;
  }
};

// 입추수수 삭제
export const updateChickEntry = async (chickEntryNo, chickEntryDto) => {
  try {
    const { data } = await API.put(`/chickEntry/${chickEntryNo}`, chickEntryDto);
    return data;
  } catch (err) {
    console.error('updateChickEntry error:', err);
    throw err;
  }
};


//입추수수 수정
export const deleteChickEntry = async (chickEntryNo) => {
  try {

    console.log('Request:', chickEntryNo);

    const { data } = await API.delete(`/chickEntry/${chickEntryNo}`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('deleteChickEntry error:', err);
    throw err;
  }
};

//입추수수 조회
export const getChickEntry = async (chickEntryNo) => {
  try {

    console.log('Request:', chickEntryNo);

    const { data } = await API.get(`/chickEntry/${chickEntryNo}`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('getChickEntry error:', err);
    // 필요하면 사용자용 메시지 가공 후 throw
    throw err;
  }
};

//농장동 번호로 입추수수 목록 조회(농장주)
export const getChickEntriesByFarmSectionNo = async (farmSectionNo) => {
  try {

    console.log('Request:', farmSectionNo);

    const { data } = await API.get(`/chickEntry/list?farmSectionNo=${farmSectionNo}`);
    console.log('Response:', data);

    return data;

  } catch (err) {
    console.error('getChickEntriesByFarmSectionNo error:', err);

    throw err;
  }
};

//모든 입추수수 목록 조회(관리자)
export const getAllChickEntries = async () => {
  try {

    const { data } = await API.get(`/chickEntry/list/all`);
    console.log('Response:', data);

    return data;

  } catch (err) {
    console.error('getChickEntriesByFarmSectionNo error:', err);

    throw err;
  }
};

//농장동 입추 수 누적합 조회
export const getTotalChickEntryNumberByFarmSectionNo = async (farmSectionNo) => {
  try {
    const { data } = await API.get(`/chickEntry/list/total?farmSectionNo=${farmSectionNo}`);
    console.log('Response:', data);

    return data;

  } catch (err) {
    console.error('getTotalChickEntryNumberByFarmSectionNo error:', err);

    throw err;
  }
};
