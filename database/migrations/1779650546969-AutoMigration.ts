import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779650546969 implements MigrationInterface {
  name = 'AutoMigration1779650546969';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usuarios_turmas" DROP CONSTRAINT "FK_58106da03b08c20ae71af8ae5f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios_turmas" ADD CONSTRAINT "FK_58106da03b08c20ae71af8ae5f0" FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usuarios_turmas" DROP CONSTRAINT "FK_58106da03b08c20ae71af8ae5f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "usuarios_turmas" ADD CONSTRAINT "FK_58106da03b08c20ae71af8ae5f0" FOREIGN KEY ("turma_id") REFERENCES "turmas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
