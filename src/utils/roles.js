// Maps UI role values to backend API role slugs
export const uiToApiRole = (uiRole) => {
  const map = {
    "school": "school_user",
    "it-admin": "it_admin",
    "event-coordinator": "event_coordinator",
    "district-coordinator": "district_coordinator",
    "admin": "admin",
  };
  return map[uiRole] || uiRole;
};

export const apiToUiRole = (apiRole) => {
  const map = {
    "school_user": "school",
    "it_admin": "it-admin",
    "event_coordinator": "event-coordinator",
    "district_coordinator": "district-coordinator",
    "admin": "admin",
  };
  return map[apiRole] || apiRole;
};

export default { uiToApiRole, apiToUiRole };
