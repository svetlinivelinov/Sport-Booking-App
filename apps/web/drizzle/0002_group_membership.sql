CREATE TABLE "group_members" (
  "group_id" varchar(36) NOT NULL,
  "user_id" varchar(36) NOT NULL,
  "role" varchar(16) DEFAULT 'member' NOT NULL,
  "joined_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "group_members_pk" PRIMARY KEY("group_id","user_id"),
  CONSTRAINT "group_members_role_check" CHECK ("group_members"."role" in ('member', 'manager'))
);
--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "group_members_user_idx" ON "group_members" USING btree ("user_id");
