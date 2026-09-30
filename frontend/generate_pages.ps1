$pagesDir = "d:/new project/military-asset-management/frontend/src/pages"

$transfers = @"
import React from 'react';
const Transfers = () => (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold m-0">Transfers</h2>
      <button className="btn btn-primary"><i className="bi bi-arrow-left-right me-2"></i>Initiate Transfer</button>
    </div>
    <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">No transfers found.</div></div>
  </div>
);
export default Transfers;
"@
Set-Content -Path "$pagesDir/Transfers.jsx" -Value $transfers -Encoding UTF8

$assignments = @"
import React from 'react';
const Assignments = () => (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold m-0">Assignments</h2>
      <button className="btn btn-primary"><i className="bi bi-person-plus me-2"></i>New Assignment</button>
    </div>
    <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">No assignments found.</div></div>
  </div>
);
export default Assignments;
"@
Set-Content -Path "$pagesDir/Assignments.jsx" -Value $assignments -Encoding UTF8

$expenditures = @"
import React from 'react';
const Expenditures = () => (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold m-0">Expenditures</h2>
      <button className="btn btn-danger"><i className="bi bi-dash-circle me-2"></i>Record Expenditure</button>
    </div>
    <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">No expenditures found.</div></div>
  </div>
);
export default Expenditures;
"@
Set-Content -Path "$pagesDir/Expenditures.jsx" -Value $expenditures -Encoding UTF8

$auditlogs = @"
import React from 'react';
const AuditLogs = () => (
  <div>
    <h2 className="fw-bold mb-4">Audit Logs</h2>
    <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">No audit logs found.</div></div>
  </div>
);
export default AuditLogs;
"@
Set-Content -Path "$pagesDir/AuditLogs.jsx" -Value $auditlogs -Encoding UTF8

$users = @"
import React from 'react';
const Users = () => (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold m-0">Users Management</h2>
      <button className="btn btn-primary"><i className="bi bi-person-plus me-2"></i>Add User</button>
    </div>
    <div className="card shadow-sm"><div className="card-body p-5 text-center text-muted">System users list.</div></div>
  </div>
);
export default Users;
"@
Set-Content -Path "$pagesDir/Users.jsx" -Value $users -Encoding UTF8
