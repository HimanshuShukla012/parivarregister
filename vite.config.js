// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// http://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // District details endpoint - IMPORTANT: This must come BEFORE /district_*
      "/district/": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying:", req.url, "→ Django");
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // ========== MISSING ENDPOINTS - ADDED BELOW ==========

      // Gaon (Village) endpoint - CRITICAL for FamilyEntryForm
      "/gaon": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying gaon:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes) => {
            console.log(
              "✅ Gaon response:",
              proxyRes.statusCode,
              proxyRes.headers["content-type"],
            );
          });
        },
      },

      // Operator Daily Entry Count
      "/opDailyEntryCount": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying opDailyEntryCount:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // Insert Family Member
      "/insertFamilyMember": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying insertFamilyMember:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // Get Register PDF
      "/getRegisterPDF": {
        target: "http://parivarregister.kdsgroup.co.in/app",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying getRegisterPDF:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // ========== EXISTING ENDPOINTS ==========

      "/getBlockByZila": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying getBlockByZila:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes) => {
            console.log(
              "✅ Proxy response:",
              proxyRes.statusCode,
              proxyRes.headers["content-type"],
            );
          });
        },
      },

      "/getApprovedGaonListWithCodeByBlock": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying getApprovedGaonList:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // Sachiv-specific endpoints
      "/getGaonBySabha": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getGaonData": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/sachivApprove": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/update-and-insert": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/approveFamilySachiv": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/rejectFamilySachiv": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getPDFPage": {
        target: "http://parivarregister.kdsgroup.co.in/app",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying getPDFPage:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes) => {
            console.log("✅ PDF Response:", proxyRes.statusCode);
          });
        },
      },
      "/downloadGaonSachiv": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/resetPassword": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/ajax_logout": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // HQ Dashboard endpoints
      "/district_download_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              proxyRes.headers["set-cookie"] = setCookie;
            }
          });
        },
      },
      "/district_overview_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/district_target_report_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/district_report_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/download_district_report_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying download:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(
              "✅ Download response:",
              proxyRes.statusCode,
              proxyRes.headers["content-type"],
            );
          });
        },
      },
      "/download_block_target_report_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/block_target_report_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      //DPRO Dashboard API
      "/tehsil_gp_target_report_api_": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/pending_gp_verification_report_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/gp_wise_detail_report_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/block_target_report_download": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/verification_status_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/district_data_by_login": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying district_data_by_login:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/getZila": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/csrf": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              proxyRes.headers["set-cookie"] = setCookie;
            }
          });
        },
      },
      "/login": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/logout": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/force_logout": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (setCookie) {
              proxyRes.headers["set-cookie"] = setCookie;
            }
          });
        },
      },

      // ========== PROJECT MONITORING ENDPOINTS ==========

      // Digitisation Status Tables
      "/digitisationStatusTbl": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/digitisationStatusTblByZila": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // Date Range Entry Report
      "/downloadEntryDoneInRange": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // Takeover/Handover Summary
      "/downloadTakeoverHandoverSummary": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // Master Digitisation Report
      "/export_village_detailed_report": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/adminProjectMonitoringCards": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/adminProjectMonitoringTbls": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadDistrictReport": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadBlockReport": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // ========== OPERATOR MONITORING ENDPOINTS ==========
      "/adminOpMonitoringCards": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/district_overview_excel_api": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/get_operator_family_counts_monthly": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/get_operator_family_counts_today": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getOperatorsByZila": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/get_operator_monthly_entries_summary": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/download_operator_family_counts_monthly": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/download_operator_family_counts_today": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/download_operator_monthly_entries_summary": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // ========== DATA MONITORING ENDPOINTS ==========
      "/adminDataMonitoringCards": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/pDFOverviewTbl": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/blockFamilyCount": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/vilFamilyCount": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadPDFZipNew": {
        target: "http://parivarregister.kdsgroup.co.in/app",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/get_supervisor_family_counts_today": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getSupsByZila": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/get_supervisor_monthly_entries_summary": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadDistFamilyCount": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadBlockFamilyCount": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadVilFamilyCount": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/download_supervisor_family_counts_today": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/download_supervisor_monthly_entries_summary": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getGaonListWithCodeByBlock": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/download_supervisor_excel_report": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadDigitisationStatusTblByZila": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/get_gaon_family_counts": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // Add these proxy configurations to your existing vite.config.js

      // Inside the server.proxy object, add these new endpoints:

      // ========== PM APPROVAL/ROLLBACK ENDPOINTS - ADD THESE ==========
      "/getRejectedGaonList_": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying getRejectedGaonList_:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes, req, res) => {
            console.log(
              "✅ Response:",
              proxyRes.statusCode,
              proxyRes.headers["content-type"],
            );

            // Log error responses for debugging
            if (proxyRes.statusCode >= 400) {
              let body = "";
              proxyRes.on("data", (chunk) => {
                body += chunk;
              });
              proxyRes.on("end", () => {
                console.error("❌ Error Response Body:", body);
              });
            }
          });
          proxy.on("error", (err, req, res) => {
            console.error("❌ Proxy Error:", err);
          });
        },
      },

      "/getRejectedByGaonCode": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying getRejectedByGaonCode:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/get_supervisors_desu": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying get_supervisors_desu:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/assignSupervisorToRejectedFamilies": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(
              "🔄 Proxying assignSupervisorToRejectedFamilies:",
              req.url,
            );
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/getAssignedRejectedDataBySupervisor": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(
              "🔄 Proxying getAssignedRejectedDataBySupervisor:",
              req.url,
            );
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/get_updated_rejected_families": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying get_updated_rejected_families:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/get_updated_rejected_gaon": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying get_updated_rejected_gaon:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/bulk-approve-rejected-families": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying bulk-approve-rejected-families:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/approve-rejected-family": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying approve-rejected-family:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/get_approved_gaon_codes": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying get_approved_gaon_codes:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/get_all_approved_by_pm_data": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log("🔄 Proxying get_all_approved_by_pm_data:", req.url);
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      // Add after the existing supervisor endpoints section
      "/getPendingVilSupervisor": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getCompletedVilSupervisor": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getRejectedFamilies": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getRejectedGaonList": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/supervisorUpdate": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/supervisorRejectedUpdate": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/supervisorApprove": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/approveFamilySup": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/approveRejectedFamilySup": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/deleteRecord": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/deleteRejectedRecord": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/addRecordAfter": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/addRejectedRecordAfter": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/deleteDuplicate": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadPendingGaonExcel": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadGaonSupervisor": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/getOperators": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/insertNewOperator": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/deleteOperator": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/vilNotStartedTblDESU": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
      "/downloadVilNotStartedTblDESU": {
        target: "https://prtest1.kdsgroup.co.in:8000/",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },
    },
  },
});
