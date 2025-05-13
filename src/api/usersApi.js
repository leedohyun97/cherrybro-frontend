import API from './axiosInstance';

//사용자 등록
export const createUsers = async (UsersJoinDto) => {
  try {
    console.log('Request:', UsersJoinDto);

    const { data } = await API.post('/users', UsersJoinDto);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('createUsers error:', err);
    throw err;
  }
};

// 사용자 수정
export const updateUsers = async (UsersNo, UsersDto) => {
  try {
    const { data } = await API.put(`/users/${UsersNo}`, UsersDto);
    return data;
  } catch (err) {
    console.error('updateUsers error:', err);
    throw err;
  }
};


//사용자 삭제
export const deleteUsers = async (UsersNo) => {
  try {

    console.log('Request:', UsersNo);

    const { data } = await API.delete(`/users/${UsersNo}`);

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('deleteUsers error:', err);
    throw err;
  }
};

//사용자 조회
export const getUsers = async (token) => {
  try {

    console.log('Request:', token);

    const { data } = await API.get(`/users`, {
      headers: {
        Authorization: `Bearer ${token}`// 헤더에 토큰 추가
        }  
      });

    console.log('Response:', data);
    return data;
  } catch (err) {
    console.error('getUsers error:', err);
    throw err;  
  }
};

//로그인
export const loginAction = async (sendJsonObject) => {

  console.log("loginActionApi Request Data : ", sendJsonObject);

  const header = {headers: {"Content-Type": "application/x-www-form-urlencoded"}, withCredentials: true};

  const form = new FormData();
  form.append('username', sendJsonObject.usersId);
  form.append('password', sendJsonObject.usersPassword);

  console.log("loginActionApi formData : ", sendJsonObject.usersId);
  console.log("loginActionApi formData : ", sendJsonObject.usersPassword);

  const response = await API.post('/login', form, header);

  return response.data;
};

//사용자 아이디 중복 조회
export const checkUserIdDuplicate = async (usersId) => {
  try {

    console.log('Request:', usersId);

    const { data } = await API.get(`/users/check-id?usersId=${usersId}`);

    console.log('Response:', data);

    return data;

  } catch (err) {

    console.error('checkUserIdDuplicate error:', err);
    throw err;  
  }
};
