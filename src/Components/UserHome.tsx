import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0, User } from "@auth0/auth0-react";
import axios from "axios";
import { backendUrl } from "../utils";
import { Button, Text } from "@mantine/core";
import { UseApp } from "./Context";

export default function HomePage() {
  return (
    <div>
      Home Page
      <Text color="blue">Welcome to Mantine!</Text>
      <Button radius="md" color="aqua">
        BUTTON 1
      </Button>
      <Button color="blue">BUTTON 2</Button>
      <Button color="greyBlue">BUTTON 3</Button>
      <Button color="green">BUTTON 1</Button>
      <Button color="purple">BUTTON 1</Button>
      <Button color="beige">BUTTON 1</Button>
    </div>
  );
}
