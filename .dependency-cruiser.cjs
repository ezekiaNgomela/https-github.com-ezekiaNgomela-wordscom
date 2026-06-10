module.exports = {
  forbidden: [
    {
      name: "no-app-to-infra",
      severity: "error",
      from: { path: "^apps" },
      to: { path: "^infra" }
    },
    {
      name: "no-services-to-infra",
      severity: "error",
      from: { path: "^services" },
      to: { path: "^infra" }
    },
    {
      name: "no-packages-to-everything",
      severity: "error",
      from: { path: "^packages" },
      to: { path: "^(apps|services|infra|platform)" }
    },
    {
      name: "infra-is-isolated",
      severity: "error",
      from: { path: "^infra" },
      to: { path: "^(apps|services|platform|packages)" }
    }
  ],

  options: {
    doNotFollow: {
      path: "node_modules"
    },
    tsConfig: {
      fileName: "tsconfig.json"
    },
    combinedDependencies: true
  }
};
