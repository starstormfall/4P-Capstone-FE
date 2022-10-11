import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

export default function BeFriendPage() {
  return (
    <div>
      BeFriendPage Page
      <Outlet />
    </div>
  );
}
