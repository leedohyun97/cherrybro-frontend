import API from './axiosInstance';

//도사 등록
export const createChickDisposal = async (chickDisposalDto) => {
  try {
    console.log('Request:', chickDisposalDto);

    const { data } = await API.post('/chickDisposal', chickDisposalDto);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('createChickDisposal error:', err);
    // 필요하면 사용자용 메시지 가공 후 throw
    throw err;
  }
};

//도사 수정
export const updateChickDisposal = async (chickDisposalNo, chickDisposalDto) => {
  try {
    const { data } = await API.put(`/chickDisposal/${chickDisposalNo}`, chickDisposalDto);
    return data;
  } catch (e) {
    console.error('updateChickDisposal error:', e);
    throw e;
  }
};


//도사 삭제
export const deleteChickDisposal = async (chickDisposalNo) => {
  try {

    console.log('Request:', chickDisposalNo);

    const { data } = await API.delete(`/chickDisposal/${chickDisposalNo}`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('deleteChickDisposal error:', err);
    throw err;
  }
};

//도사 조회
export const getChickDisposal = async (chickDisposalNo) => {
  try {

    console.log('Request:', chickDisposalNo);

    const { data } = await API.get(`/chickDisposal/${chickDisposalNo}`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('getChickDisposal error:', err);
    // 필요하면 사용자용 메시지 가공 후 throw
    throw err;
  }
};

//도사 목록 조회
export const getChickDisposalByFarmSectionNo = async (farmSectionNo) => {
  try {
    console.log('Request:', farmSectionNo);

    const { data } = await API.get(`/chickDisposal/list?farmSectionNo=${farmSectionNo}`);
    console.log('Response:', data);

    return data;
    
  } catch (err) {
    console.error('getChickDisposalByFarmSectionNo error:', err);
    throw err;
  }
};

//모든 도사 목록 조회(관리자)
export const getAllChickDisposal = async () => {
  try {
    const { data } = await API.get(`/chickDisposal/list/all`);
    console.log('Response:', data);

    return data;
    
  } catch (err) {
    console.error('getAllChickDisposal error:', err);
    throw err;
  }
};

//농장동 도사 수 누적합 조회
export const getTotalChickDisposalNumberByFarmSectionNo = async (farmSectionNo) => {
  try {
    const { data } = await API.get(`/chickDisposal/list/total?farmSectionNo=${farmSectionNo}`);
    console.log('Response:', data);

    return data;

  } catch (err) {
    console.error('getTotalChickDisposalNumberByFarmSectionNo error:', err);

    throw err;
  }
};