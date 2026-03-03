import api from "./api";

const getDivisionReport = async (username) => {
  const response = await api.get(
    `/division_gp_target_report_api/?${username}`
  );
  return response.data;
};

export default {
  getDivisionReport,
};