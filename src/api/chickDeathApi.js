import API from "./axiosInstance";

//폐사 등록
export const createChickDeath = async (chickDeathDto) => {
  try {
    console.log("Request:", chickDeathDto);

    const { data } = await API.post("/chickDeath", chickDeathDto);

    console.log("Response:", data);
    return data;
  } catch (err) {
    console.error("createChickDeath error:", err);
    // 필요하면 사용자용 메시지 가공 후 throw
    throw err;
  }
};

//폐사 수정
export const updateChickDeath = async (chickDeathNo, chickDeathDto) => {
  try {
    const { data } = await API.put(
      `/chickDeath/${chickDeathNo}`,
      chickDeathDto
    );
    return data;
  } catch (e) {
    console.error("updateChickDeath error:", e);
    throw e;
  }
};

//폐사 삭제
export const deleteChickDeath = async (chickDeathNo) => {
  try {
    console.log("Request:", chickDeathNo);

    const { data } = await API.delete(`/chickDeath/${chickDeathNo}`);

    console.log("Response:", data);
    return data;
  } catch (err) {
    console.error("deleteChickDeath error:", err);
    throw err;
  }
};

//폐사 조회
export const getChickDeath = async (chickDeathNo) => {
  try {
    console.log("Request:", chickDeathNo);

    const { data } = await API.get(`/chickDeath/${chickDeathNo}`);

    console.log("Response:", data);
    return data;
  } catch (err) {
    console.error("getChickDeath error:", err);
    // 필요하면 사용자용 메시지 가공 후 throw
    throw err;
  }
};

//폐사 목록 조회
export const getChickDeathByFarmSectionNo = async (farmSectionNo) => {
  try {
    console.log("Request:", farmSectionNo);

    const { data } = await API.get(
      `/chickDeath/list?farmSectionNo=${farmSectionNo}`
    );
    console.log("Response:", data);

    return data;
  } catch (err) {
    console.error("getChickDeathByFarmSectionNo error:", err);
    throw err;
  }
};

//모든 폐사 목록 조회(관리자)
export const getAllChickDeath = async () => {
  try {
    const { data } = await API.get(`/chickDeath/list/all`);
    console.log("Response:", data);

    return data;
  } catch (err) {
    console.error("getAllChickDeath error:", err);
    throw err;
  }
};

//농장동 폐사 수 누적합 조회
export const getTotalChickDeathNumberByFarmSectionNo = async (
  farmSectionNo
) => {
  try {
    const { data } = await API.get(
      `/chickDeath/list/total?farmSectionNo=${farmSectionNo}`
    );
    console.log("Response:", data);

    return data;
  } catch (err) {
    console.error("getTotalChickDeathNumberByFarmSectionNo error:", err);

    throw err;
  }
};
