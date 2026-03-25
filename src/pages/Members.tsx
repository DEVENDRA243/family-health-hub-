import { AvatarWithFallback } from "@/components/shared/AvatarWithFallback";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";

const demoMembers = [
  { id: "1", name: "Dad", age: 55, gender: "male", conditions: ["Diabetes", "Hypertension"], photoUrl: null },
  { id: "2", name: "Mom", age: 52, gender: "female", conditions: ["Thyroid"], photoUrl: null },
  { id: "3", name: "Grandma", age: 78, gender: "female", conditions: ["Cholesterol", "Arthritis"], photoUrl: null },
  { id: "4", name: "Grandpa", age: 80, gender: "male", conditions: ["Blood Pressure"], photoUrl: null },
];

export default function Members() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Family Members</h1>
          <p className="caption mt-1">{demoMembers.length} of 5 members</p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {demoMembers.map((member) => (
          <div key={member.id} className="card-medical">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AvatarWithFallback name={member.name} size="lg" />
                <div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="caption">{member.age} yrs · {member.gender}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {member.conditions.map((condition) => (
                <span
                  key={condition}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {condition}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
