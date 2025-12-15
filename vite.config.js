// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // District details endpoint - IMPORTANT: This must come BEFORE /district_*
      "/district/": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
              proxyRes.headers["content-type"]
            );
          });
        },
      },

      // Operator Daily Entry Count
      "/opDailyEntryCount": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://parivarregister.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
              proxyRes.headers["content-type"]
            );
          });
        },
      },

      "/getApprovedGaonListWithCodeByBlock": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://parivarregister.kdsgroup.co.in",
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
      "/downloadGaonSachiv": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
              proxyRes.headers["content-type"]
            );
          });
        },
      },
      "/download_block_target_report_api": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
      "/getZila": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
      "/logout": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
      "/download_master_digitisation_report": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://parivarregister.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
              proxyRes.headers["content-type"]
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(
              "🔄 Proxying assignSupervisorToRejectedFamilies:",
              req.url
            );
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/getAssignedRejectedDataBySupervisor": {
        target: "https://register.kdsgroup.co.in",
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(
              "🔄 Proxying getAssignedRejectedDataBySupervisor:",
              req.url
            );
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
        },
      },

      "/get_updated_rejected_families": {
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
        target: "https://register.kdsgroup.co.in",
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
    },
  },
});
