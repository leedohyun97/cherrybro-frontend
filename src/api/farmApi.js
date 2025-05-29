import API from "./axiosInstance";

//농장 등록
export const createFarm = async (FarmDto) => {
  try {
    console.log("Request:", FarmDto);

    const { data } = await API.post("/farm", FarmDto);

    console.log("Response:", data);
    return data;
  } catch (err) {
    console.error("createFarm error:", err);
    throw err;
  }
};

// 농장 수정
export const updateFarm = async (FarmNo, FarmDto) => {
  try {
    const { data } = await API.put(`/farm/${FarmNo}`, FarmDto);
    return data;
  } catch (err) {
    console.error("updateFarm error:", err);
    throw err;
  }
};

//농장 삭제
export const deleteFarm = async (FarmNo) => {
  try {
    console.log("Request:", FarmNo);

    const { data } = await API.delete(`/farm/${FarmNo}`);

    console.log("Response:", data);
    return data;
  } catch (err) {
    console.error("deleteFarm error:", err);
    throw err;
  }
};

//농장 번호로 농장 조회(관리자)
export const getFarmByFarmNo = async (token, FarmNo) => {
  try {
    console.log("Request:", FarmNo);

    const { data } = await API.get(`/farm/by-farmNo/${FarmNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response:", data);
    return data;
  } catch (err) {
    console.error("getFarm error:", err);
    throw err;
  }
};

//사용자 번호로 농장 조회(농장주)
export const getMyFarm = async (token) => {
  try {
    const { data } = await API.get(`/farm/my-farm`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response:", data);
    return data;
  } catch (err) {
    console.error("getFarm error:", err);
    throw err;
  }
};

//사용자 번호로 농장 조회(관리자)
export const getFarmByUsersNo = async (token, usersNo) => {
  try {
    const { data } = await API.get(`/farm/${usersNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Response:", data);
    return data;
  } catch (err) {
    console.error("getFarm error:", err);
    throw err;
  }
};

//농장 목록 조회
export const getAllFarm = async (token) => {
  try {
    const { data } = await API.get("/farm/list", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Response:", data);

    return data;
  } catch (err) {
    console.error("getAllFarm error:", err);
    throw err;
  }
};
