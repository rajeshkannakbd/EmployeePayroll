// // import java.util.List;
// // import java.util.ArrayList;


// // public class PayRollTest {
// // private BigDecimal grossSalary;
// // private BigDecimal epf;
// // private BigDecimal professionalTax;
// // private BigDecimal tds;
// // private BigDecimal otherDeductions;
// //   public PayRollTest(){

// //   };
// //   public PayRollTest(BigDecimal grossSalary, BigDecimal epf, BigDecimal professionalTax, BigDecimal tds,BigDecimal otherDeductions){
// //     this.grossSalary=grossSalary;
// //     this.epf=epf;
// //     this.professionalTax=professionalTax;
// //     this.tds = tds;
// //     this.otherDeductions=otherDeductions;
// //   }
// //   public BigDecimal getGrossSalary(){
// //     return grossSalary;
// //   }
// //   public void setGrossSalary(BigDecimal grossSalary){
// //     this.grossSalary=grossSalary;
// //   }
// //   public BigDecimal getEpf(){
// //     return epf;
// //   }
// //   public void setEpf(BigDecimal epf){
// //     this.epf=epf;
// //   }
// //    public BigDecimal getProfessionalTax(){
// //     return professionalTax;
// //   }
// //   public void setProfessionalTax(BigDecimal professionalTax){
// //     this.professionalTax=professionalTax;
// //   }
// //     public BigDecimal getOtherDeductions(){
// //     return otherDeductions;
// //   }
// //   public void setOtherDeductions(BigDecimal otherDeductions){
// //     this.otherDeductions=otherDeductions;
// //   }
// //     public BigDecimal getTds(){
// //     return tds;
// //   }
// //   public void setTds(BigDecimal tds){
// //     this.tds=tds;
// //   }
  
// //   public BigDecimal calculateGrossSalary(){
// //     return getGrossSalary() + getepf() + getprofessionalTax();
// //   }
// //   public BigDecimal calculateNetSalary(){
// //     return calculateGrossSalary()-getotherDeductions();
// //   }

// //   public void displayReport(){
// //      System.out.println("Gross Salary: " +calculateGrossSalary());
// //      System.out.println("Net salary: " +calculateNetSalary());
// //   } 
// //   public static void main(String[] args){
// //     // List<PayRollTest> payrolls = new ArrayList<>();
// //     PayRollTest payroll1 = new PayRollTest(69000,4800,200,3500,500);
// //     // PayRollTest payroll2 = new PayRollTest(50000,17000,4000,6000);
// //     // payrolls.add(payroll1);
// //     // payrolls.add(payroll2);
// //     // System.out.println(payrolls.size());
// //     //   for(PayRollTest payroll : payrolls ){
// //     //     System.out.println("Employee salary: ");
// //     //     payroll.displayReport();
// //     //  }
// //     // }     
   
// // }

// import java.util.List;
// import java.util.ArrayList;
// import java.math.BigDecimal;


// public class PayRollTest {
// private BigDecimal grossSalary;
// private BigDecimal epf;
// private BigDecimal professionalTax;
// private BigDecimal tds;
// private BigDecimal otherDeductions;
//   public PayRollTest(){

//   };
//   public PayRollTest(BigDecimal grossSalary, BigDecimal epf, BigDecimal professionalTax, BigDecimal tds,BigDecimal otherDeductions){
//     this.grossSalary=grossSalary;
//     this.epf=epf;
//     this.professionalTax=professionalTax;
//     this.tds = tds;
//     this.otherDeductions=otherDeductions;
//   }
//   public BigDecimal getGrossSalary(){
//     return grossSalary;
//   }
//   public void setGrossSalary(BigDecimal grossSalary){
//     this.grossSalary=grossSalary;
//   }
//   public BigDecimal getEpf(){
//     return epf;
//   }
//   public void setEpf(BigDecimal epf){
//     this.epf=epf;
//   }
//    public BigDecimal getProfessionalTax(){
//     return professionalTax;
//   }
//   public void setProfessionalTax(BigDecimal professionalTax){
//     this.professionalTax=professionalTax;
//   }
//     public BigDecimal getOtherDeductions(){
//     return otherDeductions;
//   }
//   public void setOtherDeductions(BigDecimal otherDeductions){
//     this.otherDeductions=otherDeductions;
//   }
//     public BigDecimal getTds(){
//     return tds;
//   }
//   public void setTds(BigDecimal tds){
//     this.tds=tds;
//   }
  
//   public BigDecimal GrossSalary(){
//     return getGrossSalary();
//   }
//    public BigDecimal AllDeductions(){
//     return getTds().add(getOtherDeductions()).add(getEpf()).add(getProfessionalTax());
//   }
//   public BigDecimal calculateNetSalary(){
//     return GrossSalary().subtract(AllDeductions());
//   }

//   public void displayReport(){
//      System.out.println("Gross Salary: " +GrossSalary());
//       System.out.println("Total Deductions: " +AllDeductions());
//      System.out.println("Net salary: " +calculateNetSalary());
//   } 
//   public static void main(String[] args){
//     PayRollTest payroll1 = new PayRollTest(
//         BigDecimal.valueOf(69000),
//         BigDecimal.valueOf(4800),
//         BigDecimal.valueOf(200),
//         BigDecimal.valueOf(3500),
//         BigDecimal.valueOf(500)
//     );
//     payroll1.displayReport();
//   }
// }

