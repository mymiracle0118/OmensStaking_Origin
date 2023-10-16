import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useDigsite } from "../hooks/use-current-digsite";
import Icon from "./icons";

export const NavBar = (props: any) => {
  const { currentDigsite, setCurrentDigsite } = useDigsite();

  console.log(currentDigsite);

  return (
    <div className={classNames("w-full pt-4 pl-4 pr-32")}>
      <div className="flex justify-between items-center">
        <div
          className={classNames(
            currentDigsite ? `text-${currentDigsite}Accent` : "text-primary"
          )}
        >
          <Icon glyph="logo" size="125" height={111} />
        </div>
        <div className="flex">
          <a
            className={classNames(
              "font-viet uppercase tracking-spaced font-bold tracking-spaced text-xl mx-4 cursor-pointer hover:text-white",
              currentDigsite ? `text-${currentDigsite}Accent` : "text-primary"
            )}
            onClick={() => setCurrentDigsite(null)}
          >
            DIGSITES
          </a>
          <a
            className={classNames(
              "font-viet uppercase tracking-spaced font-bold tracking-spaced text-xl mx-4 cursor-pointer hover:text-white",
              currentDigsite ? `text-${currentDigsite}Accent` : "text-primary"
            )}
          >
            CUSTOMIZATION
          </a>
          <a
            className={classNames(
              "font-viet uppercase tracking-spaced font-bold tracking-spaced text-xl mx-4 cursor-pointer hover:text-white",
              currentDigsite ? `text-${currentDigsite}Accent` : "text-primary"
            )}
          >
            MARKETPLACE
          </a>
          <a
            className={classNames(
              "font-viet uppercase tracking-spaced font-bold tracking-spaced text-xl mx-4 cursor-pointer hover:text-white",
              currentDigsite ? `text-${currentDigsite}Accent` : "text-primary"
            )}
          >
            <Icon glyph={"discord"} />
          </a>
          <a
            className={classNames(
              "font-viet uppercase tracking-spaced font-bold tracking-spaced text-xl mx-4 cursor-pointer hover:text-white",
              currentDigsite ? `text-${currentDigsite}Accent` : "text-primary"
            )}
          >
            <Icon glyph={"twitter"} />
          </a>
        </div>
      </div>
    </div>
  );
};
