// src/components/supervisor/SupervisorSidebar.jsx
import React, { useState } from "react";

const SupervisorSidebar = ({
  user,
  onPendingRegisterClick,
  onCompletedRegisterClick,
  onRejectedFamiliesClick,
  onAssignedFamiliesClick,
  onVilPendingClick,
  onDashboardClick,
  onManageOperatorsClick,
  onChangePassword,
  onLogout,
  rejectedHasFlicker,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("");

  return (
    <>
      <div
        className={`sidebar ${collapsed ? "hidden" : ""}`}
        style={{
  width: collapsed ? "0px" : "280px",
  height: "100vh",
  background: "linear-gradient(180deg,#0f172a,#1e293b)",
  color: "#fff",
  padding: collapsed ? "0" : "12px",
  overflow: collapsed ? "hidden" : "auto",
  transition: "width 0.3s ease, padding 0.3s ease",
  flexShrink: 0,
  position: "sticky",
  top: 0,
  zIndex: 100,
}}
      >
        {/* Collapse Button */}
        <div style={{ textAlign: "right" }}>
          <button
            className="toggleBtn"
            onClick={() => setCollapsed(true)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            <i className="fa fa-arrow-left"></i>
          </button>
        </div>

        {/* Header */}
        <div
          style={{
            textAlign: "center",
            padding: "16px 0",
            borderBottom: "1px solid #334155",
          }}
        >
          <i
            className="fas fa-user-shield"
            style={{ fontSize: "42px", color: "#60a5fa" }}
          ></i>
          <h3 style={{ marginTop: "8px" }}>{user.name}</h3>
        </div>

        {/* Info Card */}
        <div
          style={{
            background: "#1e293b",
            borderRadius: "12px",
            marginTop: "12px",
            padding: "10px",
            fontSize: "14px",
          }}
        >
          <table style={{ width: "100%" }}>
            <tbody>
              {user.districts.map((district, idx) => (
                <tr key={idx}>
                  <td style={{ color: "#cbd5f5", padding: "6px" }}>
                    Allotted District
                  </td>
                  <td style={{ textAlign: "right", padding: "6px" }}>
                    {district}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Menu Buttons */}
        <div style={{ marginTop: "12px" }}>
          <SidebarBtn
            label="Dashboard"
            active={activeItem === "dashboard"}
            onClick={() => {
              setActiveItem("dashboard");
              onDashboardClick();
            }}
          />

          <SidebarBtn
            label="Manage Operator"
            active={activeItem === "operator"}
            onClick={() => {
              setActiveItem("operator");
              onManageOperatorsClick();
            }}
          />

          <SidebarBtn
            label="Villages Pending for Entry"
            active={activeItem === "village"}
            onClick={() => {
              setActiveItem("village");
              onVilPendingClick();
            }}
          />

          <SidebarBtn
            label="Pending Register"
            active={activeItem === "pending"}
            onClick={() => {
              setActiveItem("pending");
              onPendingRegisterClick();
            }}
          />

          <SidebarBtn
            label="Completed Registers"
            active={activeItem === "completed"}
            onClick={() => {
              setActiveItem("completed");
              onCompletedRegisterClick();
            }}
          />

          {/* <SidebarBtn
            label="Rejected Families"
            active={activeItem === "rejected"}
            onClick={() => {
              setActiveItem("rejected");
              onRejectedFamiliesClick();
            }}
            flicker={rejectedHasFlicker}
          /> */}

          <SidebarBtn
            label="PM Assigned Families"
            active={activeItem === "assigned"}
            onClick={() => {
              setActiveItem("assigned");
              onAssignedFamiliesClick();
            }}
            flicker={false}
          />
        </div>

        {/* Change Password */}
        <div
          onClick={onChangePassword}
          style={{
            marginTop: "14px",
            padding: "10px",
            borderRadius: "10px",
            background: "#334155",
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          <i className="fas fa-key"></i> Change Password
        </div>

        {/* Logout */}
        <div
          onClick={onLogout}
          style={{
            marginTop: "10px",
            padding: "12px",
            borderRadius: "12px",
            background: "#7f1d1d",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <i className="fas fa-sign-out-alt"></i> Logout
        </div>
      </div>

      {/* Open Button */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            position: "fixed",
            left: "10px",
            top: "10px",
            background: "#1e293b",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <i className="fa fa-arrow-right"></i>
        </button>
      )}
    </>
  );
};

const SidebarBtn = ({ label, onClick, flicker, active }) => (
  <div
    onClick={onClick}
    style={{
      background: active ? "#2563eb" : "#1e293b",
      color: active ? "#ffffff" : "#e5e7eb",
      marginTop: "8px",
      padding: "10px",
      borderRadius: "10px",
      cursor: "pointer",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "0.3s",
    }}
  >
    <span>{label}</span>
    {flicker && (
      <span
        style={{
          width: "8px",
          height: "8px",
          background: "red",
          borderRadius: "50%",
        }}
      ></span>
    )}
  </div>
);

export default SupervisorSidebar;
