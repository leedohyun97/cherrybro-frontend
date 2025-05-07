import API from './axiosInstance';

//농장동 등록
export const createFarmSection = async (FarmSectionDto) => {
  try {
    console.log('Request:', FarmSectionDto);

    const { data } = await API.post('/farmSection', FarmSectionDto);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('createFarmSection error:', err);
    throw err;
  }
};

// 농장동 수정
export const updateFarmSection = async (FarmSectionNo, FarmSectionDto) => {
  try {
    const { data } = await API.put(`/farmSection/${FarmSectionNo}`, FarmSectionDto);
    return data;
  } catch (err) {
    console.error('updateFarmSection error:', err);
    throw err;
  }
};


//농장동 삭제
export const deleteFarmSection = async (FarmSectionNo) => {
  try {

    console.log('Request:', FarmSectionNo);

    const { data } = await API.delete(`/farmSection/${FarmSectionNo}`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('deleteFarmSection error:', err);
    throw err;
  }
};

//농장동 조회
export const getFarmSectionByFarmSectionNo = async (FarmSectionNo) => {
  try {

    console.log('Request:', FarmSectionNo);

    const { data } = await API.get(`/farmSection/${FarmSectionNo}`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('getFarmSection error:', err);
    throw err;
  }
};

//농장동 목록 조회
export const getAllFarmSection = async () => {
  try {

    const { data } = await API.get(`/farmSection`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('getAllFarmSection error:', err);
    throw err;
  }
};

//농장 번호로 농장동 목록 조회
export const getAllFarmSectionByFarmNo = async (FarmNo) => {
  try {

    console.log('Request:', FarmNo);
    
    const { data } = await API.get(`/farmSection/list/by-farm?farmNo=${FarmNo}`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('getAllFarmSectionByFarmNo error:', err);
    throw err;
  }
};
